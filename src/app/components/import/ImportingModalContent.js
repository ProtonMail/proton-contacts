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

const ImportingModalContent = ({ extension, file, vcardContacts, privateKey, onFinish }) => {
    const api = useApi();

    const isVcf = extension === 'vcf';
    const [loading, withLoading] = useLoading(true);
    const [errorCollection, setErrorCollection] = useState([]);
    const [model, setModel] = useState({
        total: vcardContacts.length,
        parsed: [...vcardContacts],
        encrypted: [],
        imported: 0,
        failedOnEncrypt: [],
        failedOnParse: [],
        failedOnImport: []
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
        const parseVcf = (vcf = '', { signal }) => {
            // deal with cancellation by hand through signal.aborted
            const vcards = extractVcards(vcf);
            !signal.aborted && setModel({ ...model, total: vcards.length });

            const { parsedContacts, indexMap } = signal.aborted
                ? {}
                : vcards.reduce(
                      (acc, vcard, i) => {
                          const { parsedContacts, indexMap } = acc;
                          try {
                              const parsedVcard = parseVcard(vcard);
                              indexMap[acc.parsedContacts.length] = i;
                              parsedContacts.push(parsedVcard);
                          } catch {
                              !signal.aborted &&
                                  setModel((model) => ({ ...model, failedOnParse: [...model.failedOnParse, i] }));
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
        const saveBatch = async ({ contacts = [], indexMap, labels }, { signal }) => {
            if (signal.aborted) {
                return;
            }

            const responses = (await apiWithAbort(
                addContacts({ Contacts: contacts, Overwrite: OVERWRITE_CONTACT, Labels: labels })
            )).Responses.map(({ Response }) => Response);

            const { importedBatch, failedOnImportBatch } = responses.reduce(
                (acc, { Code, Error }, i) => {
                    if (Code === SUCCESS_IMPORT_CODE) {
                        return { ...acc, importedBatch: acc.importedBatch + 1 };
                    }
                    return { ...acc, failedOnImportBatch: [...acc.failedOnImportBatch, { index: indexMap[i], Error }] };
                },
                { importedBatch: 0, failedOnImportBatch: [] }
            );
            !signal.aborted &&
                setModel((model) => ({
                    ...model,
                    imported: model.imported + importedBatch,
                    failedOnImport: [...model.failedOnImport, ...failedOnImportBatch]
                }));
        };

        /*
            Send contacts to the API in batches
        */
        const saveContacts = async ({ contacts = [], indexMap, labels }, { signal }) => {
            if (signal.aborted) {
                return;
            }

            // divide contacts and indexMap in batches
            const { contactBatches, indexMapBatches } = divideInBatches({ contacts, indexMap }, ADD_CONTACTS_MAX_SIZE);
            const apiCalls = contactBatches.length;

            for (let i = 0; i < apiCalls; i++) {
                /*
                    typically saveBatch will take longer than apiTimeout, but we include the
                    latter to avoid API overload it just in case exportBatch is too fast
                */
                await Promise.all([
                    saveBatch({ contacts: contactBatches[i], indexMap: indexMapBatches[i], labels }, { signal }),
                    wait(API_SAFE_INTERVAL)
                ]);
            }
        };

        const importContacts = async ({ signal }) => {
            const parsedVcf = parseVcf(file, { signal });
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
            await saveContacts({ contacts: withCategories, indexMap: indexMapWith, labels: INCLUDE }, { signal });
            await saveContacts({ contacts: withoutCategories, indexMap: indexMapWithout, labels: IGNORE }, { signal });
            !signal.aborted && onFinish();
        };

        withLoading(importContacts(abortController));

        return () => {
            abortController.abort();
        };
    }, []);

    useEffect(() => {
        if (loading) {
            return;
        }
        const divsFailedOnParse = model.failedOnParse.map((index) => (
            <div key={index}>
                {c('Info on errors importing contacts')
                    .t`Contact ${index} from your list could not be parsed. Invalid format`}
            </div>
        ));
        const divsFailedOnEncrypt = model.failedOnEncrypt.map((index) => (
            <div key={index}>
                {c('Info on errors importing contacts').t`Contact ${index} from your list could not be encrypted.`}
            </div>
        ));
        const divsFailedOnImport = model.failedOnImport.map(({ index, Error }) => (
            <div key={index}>
                {c('Info on errors importing contacts')
                    .t`Contact ${index} from your list could not be imported. ${Error}`}
            </div>
        ));
        const sortedErrorDivs = [...divsFailedOnParse, ...divsFailedOnEncrypt, ...divsFailedOnImport].sort(
            (div1, div2) => div1.key - div2.key
        );

        setErrorCollection(sortedErrorDivs);
    }, [loading]);

    /*
        Allocate 5% of the progress to parsing, 90% to encrypting, and 5% to sending to API
    */
    const progressParsing = percentageProgress(model.parsed.length, model.failedOnParse.length, model.total);
    const progressEncrypting = percentageProgress(
        model.encrypted.length,
        model.failedOnEncrypt.length,
        model.total - model.failedOnParse.length
    );
    const progressImporting = percentageProgress(
        model.imported,
        model.failedOnImport.length,
        model.total - model.failedOnParse.length - model.failedOnEncrypt.length
    );

    const adjustedProgress = Math.round(0.05 * progressParsing + 0.9 * progressEncrypting + 0.05 * progressImporting);

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
                    msgid`${model.imported} out of ${model.total} contact successfully imported.`,
                    `${model.imported} out of ${model.total} contacts successfully imported.`,
                    model.imported
                )}
                displayFailed={c('Progress bar description').t`No contacts imported`}
                failed={!model.imported}
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
