import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { useApi, useLoading, Alert, Details, Summary, Bordered } from 'react-components';

import DynamicProgress from '../DynamicProgress';
import ErrorDetails from './ErrorDetails';

import { addContacts } from 'proton-shared/lib/api/contacts';
import { wait } from 'proton-shared/lib/helpers/promise';
import { extractVcards, parse as parseVcard } from '../../helpers/vcard';
import { prepareContact } from '../../helpers/encrypt';
import { splitContacts, divideInBatches, trivialIndexMap } from '../../helpers/import';
import { percentageProgress } from '../../helpers/progress';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE, API_SAFE_INTERVAL, ADD_CONTACTS_MAX_SIZE } from '../../constants';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE, INCLUDE } = CATEGORIES;

const ImportingModalContent = ({ isVcf, file = '', vcardContacts, privateKey, onFinish }) => {
    const api = useApi();

    const [loading, withLoading] = useLoading(true);
    const [errorCollection, setErrorCollection] = useState([]);
    const [model, setModel] = useState({
        total: vcardContacts.length,
        parsed: [...vcardContacts],
        encrypted: [],
        submitted: 0,
        failedOnEncrypt: [],
        failedOnParse: [],
        failedOnSubmit: []
    });

    useEffect(() => {
        /*
			Prepare api for allowing cancellation in the middle of the import
		*/
        const abortController = new AbortController();
        const apiWithAbort = (config) => api({ ...config, signal: abortController.signal });

        /*
			Extract and parse contacts from a vcf file.
			Return succesfully parsed vCard contacts and an indexMap to keep track of original contact order
		*/
        const parseVcf = ({ signal }) => {
            // deal with cancellation by hand through signal.aborted
            const vcards = extractVcards(file);
            !signal.aborted && setModel({ ...model, total: vcards.length });

            const { parsedContacts, indexMap } = signal.aborted
                ? {}
                : vcards.reduce(
                      (acc, vcard, i) => {
                          const { parsedContacts, indexMap } = acc;
                          try {
                              if (vcard.includes('VERSION:2.1') || vcard.includes('VERSION:3.0')) {
                                  throw new Error('vCard versions < 4.0 not supported');
                              }
                              const parsedVcard = parseVcard(vcard);
                              indexMap[acc.parsedContacts.length] = i;
                              parsedContacts.push(parsedVcard);
                          } catch ({ message }) {
                              !signal.aborted &&
                                  setModel((model) => ({
                                      ...model,
                                      failedOnParse: [...model.failedOnParse, { index: i, Error: message }]
                                  }));
                          }
                          return acc;
                      },
                      { parsedContacts: [], indexMap: Object.create(null) }
                  );

            return { parsedContacts, indexMap };
        };

        /*
			Encrypt vCard contacts. Return succesfully encrypted contacts
			and an indexMap to keep track of original contact order
		*/
        const encryptContacts = async ({ contacts = [], indexMap }, { signal }) => {
            // deal with cancellation by hand through signal.aborted
            const publicKey = privateKey.toPublic();

            const encryptedContacts = [];
            for (const [i, contact] of contacts.entries()) {
                if (signal.aborted) {
                    return {};
                }
                try {
                    const contactEncrypted = await prepareContact(contact, privateKey, publicKey);
                    !signal.aborted &&
                        setModel((model) => ({ ...model, encrypted: [...model.encrypted, contactEncrypted] }));
                    encryptedContacts.push(contactEncrypted);
                } catch (error) {
                    !signal.aborted &&
                        setModel((model) => ({ ...model, failedOnEncrypt: [...model.failedOnEncrypt, indexMap[i]] }));
                    encryptedContacts.push('error'); // must keep for a proper counting when displaying errors
                }
            }

            const { newIndexMap } = signal.aborted
                ? {}
                : encryptedContacts.reduce(
                      (acc, contact, i) => {
                          const { newIndexMap } = acc;
                          if (contact === 'error') {
                              acc.errors++;
                              return acc;
                          }
                          newIndexMap[i - acc.errors] = indexMap[i];
                          return acc;
                      },
                      { newIndexMap: Object.create(null), errors: 0 }
                  );

            return {
                encryptedContacts: signal.aborted ? [] : encryptedContacts.filter(Boolean),
                indexMap: newIndexMap
            };
        };

        /*
			Send a batch of contacts to the API
		*/
        const submitBatch = async ({ contacts = [], indexMap, labels }, { signal }) => {
            if (signal.aborted || !contacts.length) {
                return;
            }

            const responses = (await apiWithAbort(
                addContacts({ Contacts: contacts, Overwrite: OVERWRITE_CONTACT, Labels: labels })
            )).Responses.map(({ Response }) => Response);

            const { submittedBatch, failedOnSubmitBatch } = responses.reduce(
                (acc, { Code, Error }, i) => {
                    if (Code === SUCCESS_IMPORT_CODE) {
                        return { ...acc, submittedBatch: acc.submittedBatch + 1 };
                    }
                    return { ...acc, failedOnSubmitBatch: [...acc.failedOnSubmitBatch, { index: indexMap[i], Error }] };
                },
                { submittedBatch: 0, failedOnSubmitBatch: [] }
            );
            !signal.aborted &&
                setModel((model) => ({
                    ...model,
                    submitted: model.submitted + submittedBatch,
                    failedOnSubmit: [...model.failedOnSubmit, ...failedOnSubmitBatch]
                }));
        };

        /*
			Send contacts to the API in batches
		*/
        const submitContacts = async ({ contacts = [], indexMap, labels }, { signal }) => {
            if (signal.aborted) {
                return;
            }

            // divide contacts and indexMap in batches
            const { contactBatches, indexMapBatches } = divideInBatches({ contacts, indexMap }, ADD_CONTACTS_MAX_SIZE);
            const apiCalls = contactBatches.length;

            for (let i = 0; i < apiCalls; i++) {
                // avoid overloading API in the unlikely case submitBatch is too fast
                await Promise.all([
                    submitBatch({ contacts: contactBatches[i], indexMap: indexMapBatches[i], labels }, { signal }),
                    wait(API_SAFE_INTERVAL)
                ]);
            }
        };

        /*
            All steps of the import process
        */
        const importContacts = async ({ signal }) => {
            const parsedVcf = parseVcf({ signal });
            if (isVcf) {
                !signal.aborted && setModel((model) => ({ ...model, parsed: parsedVcf.parsedContacts }));
            }
            const parsedContacts = isVcf ? parsedVcf.parsedContacts : [...vcardContacts];
            const indexMap = isVcf ? parsedVcf.indexMap : trivialIndexMap(vcardContacts);
            const { encryptedContacts, indexMap: updatedIndexMap } = await encryptContacts(
                { contacts: parsedContacts, indexMap },
                { signal }
            );
            const { withCategories, withoutCategories, indexMapWith, indexMapWithout } = splitContacts({
                contacts: encryptedContacts,
                indexMap: updatedIndexMap
            });
            await submitContacts({ contacts: withCategories, indexMap: indexMapWith, labels: INCLUDE }, { signal });
            await submitContacts(
                { contacts: withoutCategories, indexMap: indexMapWithout, labels: IGNORE },
                { signal }
            );
            !signal.aborted && (await onFinish());
        };

        withLoading(importContacts(abortController));

        return () => {
            abortController.abort();
        };
    }, []);

    useEffect(() => {
        /*
			Collect errors on import
		*/
        if (loading) {
            return;
        }
        const divsFailedOnParse = model.failedOnParse.map(({ index, Error }) => (
            <div key={index}>
                {c('Info on errors importing contacts').t`Contact ${index +
                    1} from your list could not be parsed. ${Error}`}
            </div>
        ));
        const divsFailedOnEncrypt = model.failedOnEncrypt.map((index) => (
            <div key={index}>
                {c('Info on errors importing contacts').t`Contact ${index + 1} from your list could not be encrypted.`}
            </div>
        ));
        const divsFailedOnSubmit = model.failedOnSubmit.map(({ index, Error }) => (
            <div key={index}>
                {c('Info on errors importing contacts').t`Contact ${index +
                    1} from your list could not be imported. ${Error}`}
            </div>
        ));
        const sortedErrorDivs = [...divsFailedOnParse, ...divsFailedOnEncrypt, ...divsFailedOnSubmit].sort(
            (div1, div2) => div1.key - div2.key
        );

        setErrorCollection(sortedErrorDivs);
    }, [loading]);

    /*
		Allocate 5% of the progress to parsing, 90% to encrypting, and 5% to sending to API
	*/
    const progressParsing = percentageProgress(model.parsed.length, model.failedOnParse.length, model.total);
    const totalToEncrypt = model.total - model.failedOnParse.length;
    const progressEncrypting =
        totalToEncrypt === 0 && model.total !== 0
            ? 100 // set to 100 if there are no contacts to encrypt but there are contacts to import
            : percentageProgress(model.encrypted.length, model.failedOnEncrypt.length, totalToEncrypt);
    const totalToSubmit = totalToEncrypt - model.failedOnEncrypt.length;
    const progressSubmitting =
        totalToSubmit === 0 && model.total !== 0
            ? 100 // set to 100 if there are no contacts to submit but there are contacts to import
            : percentageProgress(model.submitted, model.failedOnSubmit.length, totalToSubmit);

    const adjustedProgress = Math.round(0.05 * progressParsing + 0.9 * progressEncrypting + 0.05 * progressSubmitting);

    return (
        <>
            <Alert>
                {c('Description')
                    .t`Encrypting and importing contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-import-contacts"
                alt="contact-loader"
                value={adjustedProgress}
                displaySuccess={c('Progress bar description').ngettext(
                    msgid`${model.submitted} out of ${model.total} contact successfully imported.`,
                    `${model.submitted} out of ${model.total} contacts successfully imported.`,
                    model.submitted
                )}
                displayFailed={c('Progress bar description').t`No contacts imported`}
                failed={!model.submitted}
                endPostponed={loading}
            />
            {errorCollection.length !== 0 && (
                <Details>
                    <Summary>
                        {c('Info on errors importing contacts')
                            .t`Some contacts could not be imported. Click for details`}
                    </Summary>
                    <Bordered>{errorCollection}</Bordered>
                </Details>
            )}
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
