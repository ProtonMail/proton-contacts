import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { useApi, useLoading, Alert } from 'react-components';

import DynamicProgress from '../DynamicProgress';
import ErrorDetails from './ErrorDetails';

import { addContacts } from 'proton-shared/lib/api/contacts';
import { chunk } from 'proton-shared/lib/helpers/array';
import { wait } from 'proton-shared/lib/helpers/promise';
import { extractVcards, parse as parseVcard } from 'proton-shared/lib/contacts/vcard';
import { prepareContact } from 'proton-shared/lib/contacts/encrypt';
import { splitContacts } from '../../helpers/import';
import { combineProgress } from '../../helpers/progress';
import {
    OVERWRITE,
    CATEGORIES,
    API_SAFE_INTERVAL,
    ADD_CONTACTS_MAX_SIZE,
    MAX_SIMULTANEOUS_CONTACTS_ENCRYPT
} from '../../constants';
import { API_CODES } from 'proton-shared/lib/constants';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE, INCLUDE } = CATEGORIES;
const { SINGLE_SUCCESS } = API_CODES;
const ONE_HOUR = 1000 * 60 * 60;

const createParseErrorMessage = (index, message) =>
    c('Info on errors importing contacts').t`Contact ${index} from your list could not be parsed. ${message}`;
const createEncryptErrorMessage = (index) =>
    c('Info on errors importing contacts').t`Contact ${index} from your list could not be encrypted.`;
const createSubmitErrorMessage = (index, message) =>
    c('Info on errors importing contacts').t`Contact ${index} from your list could not be imported. ${message}`;

const ImportingModalContent = ({ isVcf, file = '', vcardContacts, privateKey, onFinish }) => {
    const api = useApi();

    const [loading, withLoading] = useLoading(true);
    const [model, setModel] = useState({
        total: vcardContacts.length,
        parsed: vcardContacts.map((contact, index) => ({ index, contact })),
        encrypted: [],
        submitted: [],
        failedOnEncrypt: [],
        failedOnParse: [],
        failedOnSubmit: []
    });

    useEffect(() => {
        // Prepare api for allowing cancellation in the middle of the import
        const abortController = new AbortController();
        const apiWithAbort = (config) => api({ ...config, signal: abortController.signal });

        /**
         * Extract and parse contacts from a vcf file. Return array of succesfully parsed vCard contacts
         * together with their index in vcardContacts to keep track of original contact order
         */
        const parseVcfContacts = ({ signal }) => {
            const vcards = extractVcards(file);
            !signal.aborted && setModel({ ...model, total: vcards.length });

            return signal.aborted
                ? []
                : vcards.reduce((acc, vcard, index) => {
                      try {
                          if (vcard.includes('VERSION:2.1') || vcard.includes('VERSION:3.0')) {
                              throw new Error('vCard versions < 4.0 not supported');
                          }
                          const parsedVcard = parseVcard(vcard);
                          acc.push({ index, contact: parsedVcard });
                      } catch ({ message }) {
                          !signal.aborted &&
                              setModel((model) => ({
                                  ...model,
                                  failedOnParse: [
                                      ...model.failedOnParse,
                                      { index, message: createParseErrorMessage(index + 1, message) }
                                  ]
                              }));
                      }
                      return acc;
                  }, []);
        };

        const encryptContact = async ({ contact, index }, publicKey, { signal }) => {
            try {
                const contactEncrypted = await prepareContact(contact, { privateKey, publicKey });
                !signal.aborted &&
                    setModel((model) => ({ ...model, encrypted: [...model.encrypted, contactEncrypted] }));
                return { index, contact: contactEncrypted };
            } catch (error) {
                !signal.aborted &&
                    setModel((model) => ({
                        ...model,
                        failedOnEncrypt: [
                            ...model.failedOnEncrypt,
                            { index, message: createEncryptErrorMessage(index + 1) }
                        ]
                    }));
                return { index, contact: { error: true } }; // must keep for a proper counting when displaying errors
            }
        };

        const encryptBatch = async (contacts = [], publicKey, { signal }) => {
            if (signal.aborted) {
                return [];
            }
            return Promise.all(contacts.map((contact) => encryptContact(contact, publicKey, { signal })));
        };

        /**
         * Encrypt vCard contacts. Return succesfully encrypted contacts
         */
        const encryptContacts = async (contacts = [], { signal }) => {
            const publicKey = privateKey.toPublic();

            // encrypt several contacts at a time to speed up the process without burning the user's machine
            const contactBatches = chunk(contacts, MAX_SIMULTANEOUS_CONTACTS_ENCRYPT);

            const encryptedContacts = [];
            for (const batch of contactBatches) {
                if (signal.aborted) {
                    return [];
                }
                const encryptedBatch = await encryptBatch(batch, publicKey, { signal });
                encryptedContacts.push(...encryptedBatch);
            }

            return encryptedContacts;
        };

        /**
         * Send a batch of contacts to the API
         */
        const submitBatch = async ({ contacts = [], labels }, { signal }) => {
            if (signal.aborted || !contacts.length) {
                return;
            }

            const indexMap = contacts.map(({ index }) => index);

            const responses = (
                await apiWithAbort(
                    addContacts({
                        Contacts: contacts.map(({ contact }) => contact),
                        Overwrite: OVERWRITE_CONTACT,
                        Labels: labels,
                        // we need to increase the standard timeout limit for this route since it may be slow sometimes
                        // 1 hour to wait for an API response is essentially infinite time
                        timeout: ONE_HOUR
                    })
                )
            ).Responses.map(({ Response }) => Response);

            if (signal.aborted) {
                return;
            }
            const { submittedBatch, failedOnSubmitBatch } = responses.reduce(
                (acc, { Code, Error, Contact: { ID } = {} }, i) => {
                    const index = indexMap[i];
                    if (Code === SINGLE_SUCCESS) {
                        acc.submittedBatch.push(ID);
                    } else {
                        acc.failedOnSubmitBatch.push({ index, message: createSubmitErrorMessage(index + 1, Error) });
                    }
                    return acc;
                },
                { submittedBatch: [], failedOnSubmitBatch: [] }
            );
            setModel((model) => ({
                ...model,
                submitted: [...model.submitted, ...submittedBatch],
                failedOnSubmit: [...model.failedOnSubmit, ...failedOnSubmitBatch]
            }));
        };

        /**
         * Send contacts to the API in batches
         */
        const submitContacts = async ({ contacts = [], labels }, { signal }) => {
            if (signal.aborted) {
                return;
            }
            // divide contacts and indexMap in batches
            const contactBatches = chunk(contacts, ADD_CONTACTS_MAX_SIZE);
            const apiCalls = contactBatches.length;

            for (let i = 0; i < apiCalls; i++) {
                // avoid overloading API in the unlikely case submitBatch is too fast
                await Promise.all([
                    submitBatch({ contacts: contactBatches[i], labels }, { signal }),
                    wait(API_SAFE_INTERVAL)
                ]);
            }
        };

        /**
         * All steps of the import process
         */
        const importContacts = async ({ signal }) => {
            const parsedContacts = isVcf
                ? parseVcfContacts({ signal })
                : vcardContacts.map((contact, index) => ({ index, contact }));
            if (isVcf) {
                !signal.aborted && setModel((model) => ({ ...model, parsed: parsedContacts }));
            }
            const encryptedContacts = await encryptContacts(parsedContacts, { signal });
            const { withCategories, withoutCategories } = splitContacts(encryptedContacts);
            await submitContacts({ contacts: withCategories, labels: INCLUDE }, { signal });
            await submitContacts({ contacts: withoutCategories, labels: IGNORE }, { signal });
            !signal.aborted && (await onFinish());
        };

        withLoading(importContacts(abortController));

        return () => {
            abortController.abort();
        };
    }, []);

    // Allocate 5% of the progress to parsing, 90% to encrypting, and 5% to sending to API
    const combinedProgress = combineProgress([
        {
            allocated: 0.05,
            successful: model.parsed.length,
            failed: model.failedOnParse.length,
            total: model.total
        },
        {
            allocated: 0.9,
            successful: model.encrypted.length,
            failed: model.failedOnEncrypt.length,
            total: model.total - model.failedOnParse.length
        },
        {
            allocated: 0.05,
            successful: model.submitted.length,
            failed: model.failedOnSubmit.length,
            total: model.total - model.failedOnParse.length - model.failedOnEncrypt.length
        }
    ]);

    return (
        <>
            <Alert>
                {c('Description')
                    .t`Encrypting and importing contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-import-contacts"
                alt="contact-loader"
                value={combinedProgress}
                displaySuccess={c('Progress bar description').ngettext(
                    msgid`${model.submitted.length} out of ${model.total} contact successfully imported.`,
                    `${model.submitted.length} out of ${model.total} contacts successfully imported.`,
                    model.submitted.length
                )}
                displayFailed={c('Progress bar description').t`No contacts imported`}
                failed={!model.submitted.length}
                endPostponed={loading}
            />
            <ErrorDetails
                loading={loading}
                errors={[...model.failedOnParse, ...model.failedOnEncrypt, ...model.failedOnSubmit]}
                summary={c('Info on errors importing contacts')
                    .t`Some contacts could not be imported. Click for details`}
            />
        </>
    );
};

ImportingModalContent.propTypes = {
    isVcf: PropTypes.bool,
    file: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ headers: PropTypes.array, contacts: PropTypes.array })
    ]).isRequired,
    vcardContacts: PropTypes.array.isRequired,
    privateKey: PropTypes.object.isRequired,
    onFinish: PropTypes.func
};

export default ImportingModalContent;
