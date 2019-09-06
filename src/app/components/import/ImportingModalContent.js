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
import { percentageProgress } from '../../helpers/progress';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE, API_SAFE_INTERVAL } from '../../constants';
import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE, INCLUDE } = CATEGORIES;
const { CLEAR_TEXT } = CONTACT_CARD_TYPE;
const IMPORT_BATCH_MAX_SIZE = 500;

const ImportingModalContent = ({ extension, file, vcardContacts, privateKey, onFinish }) => {
    const api = useApi();

    const [loading, withLoading] = useLoading(true);
    const [errorCollection, setErrorCollection] = useState([]);
    const [model, setModel] = useState({
        total: vcardContacts.length,
        encrypted: [],
        imported: 0,
        failedOnEncrypt: [],
        failedOnParse: [],
        failedOnImport: []
    });

    useEffect(() => {
        /*
            Extract and parse contacts from a vcf file.
            Return succesfully parsed vCard contacts and an indexMap to keep track of original contact order
        */
        const parseVcf = (vcf = '') => {
            const vcards = extractVcards(vcf);
            setModel({ ...model, total: vcards.length });

            return vcards.reduce(
                (acc, vcard, i) => {
                    const { parsedContacts, indexMap } = acc;
                    try {
                        const parsedVcard = parseVcard(vcard);
                        indexMap[acc.parsedContacts.length] = i;
                        parsedContacts.push(parsedVcard);
                    } catch {
                        setModel((model) => ({ ...model, failedOnParse: [...model.failedOnParse, i] }));
                    }
                    return acc;
                },
                { parsedContacts: [], indexMap: Object.create(null) }
            );
        };

        /*
            Encrypt vCard contacts. Return succesfully encrypted contacts
            and an indexMap to keep track of original contact order
        */
        const encryptContacts = async (contacts, indexMap) => {
            const publicKey = privateKey.toPublic();

            const encryptContacts = await Promise.all(
                contacts.map(async (contact, i) => {
                    try {
                        const contactEncrypted = await prepareContact(contact, privateKey, publicKey);
                        setModel((model) => ({ ...model, encrypted: [...model.encrypted, contactEncrypted] }));
                        return contactEncrypted;
                    } catch (error) {
                        setModel((model) => ({ ...model, failedOnEncrypt: [...model.failedOnEncrypt, indexMap[i]] }));
                        return 'error'; // must keep for a proper counting when displaying errors
                    }
                })
            );
            const { newIndexMap } = encryptContacts.reduce(
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

            return { encryptedContacts: encryptContacts.filter(Boolean), indexMap: newIndexMap };
        };

        /*
            Split encrypted contacts depending on having the CATEGORIES property.
            Return splitted contacts and indexMaps
        */
        const splitContacts = (contacts, indexMap) =>
            contacts.reduce(
                (acc, { Cards }, i) => {
                    const { withCategories, withoutCategories, IndexMapWith, indexMapWithout } = acc;
                    if (Cards.some(({ Type, Data }) => Type === CLEAR_TEXT && Data.includes('CATEGORIES'))) {
                        IndexMapWith[withCategories.length] = indexMap[i];
                        withCategories.push({ Cards });
                    } else {
                        indexMapWithout[withoutCategories.length] = indexMap[i];
                        withoutCategories.push({ Cards });
                    }
                    return acc;
                },
                {
                    withCategories: [],
                    withoutCategories: [],
                    IndexMapWith: Object.create(null),
                    indexMapWithout: Object.create(null)
                }
            );

        /*
            Send a batch of contacts to the API
        */
        const saveBatch = async (contacts, indexMap, labels) => {
            const responses = (await api(
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
            setModel((model) => ({
                ...model,
                imported: model.imported + importedBatch,
                failedOnImport: [...model.failedOnImport, ...failedOnImportBatch]
            }));
        };

        /*
            Send contacts to the API in batches
        */
        const saveContacts = async (contacts, indexMap, labels) => {
            const apiCalls = Math.ceil(contacts.length / IMPORT_BATCH_MAX_SIZE);
            // divide contacts and indexMap in batches
            const { contactBatches, IndexMapBatches } = contacts.reduce(
                (acc, contact, i) => {
                    const { contactBatches, IndexMapBatches } = acc;
                    const iInBatch = i % IMPORT_BATCH_MAX_SIZE;
                    if (iInBatch === 0) {
                        acc.index++;
                    }
                    contactBatches[acc.index].push(contact);
                    IndexMapBatches[acc.index][iInBatch] = indexMap[i];
                    return acc;
                },
                {
                    contactBatches: Array.from({ length: apiCalls }).map(() => []),
                    IndexMapBatches: Array.from({ length: apiCalls }).map(() => Object.create(null)),
                    index: -1
                }
            );

            for (let i = 0; i < apiCalls; i++) {
                /*
                    typically saveBatch will take longer than apiTimeout, but we include the
                    latter to avoid API overload it just in case exportBatch is too fast
                */
                await Promise.all([saveBatch(contactBatches[i], IndexMapBatches[i], labels), wait(API_SAFE_INTERVAL)]);
            }
        };

        const importContacts = async () => {
            const parsedVcf = parseVcf(file);
            const parsedContacts = extension === 'vcf' ? parsedVcf.parsedContacts : [...vcardContacts];
            const indexMap =
                extension === 'vcf'
                    ? parsedVcf.indexMap
                    : vcardContacts.reduce((acc, _contact, i) => {
                          acc[i] = i;
                          return acc;
                      }, Object.create(null));
            const { encryptedContacts, indexMap: updatedIndexMap } = await encryptContacts(parsedContacts, indexMap);
            const { withCategories, withoutCategories, IndexMapWith, indexMapWithout } = splitContacts(
                encryptedContacts,
                updatedIndexMap
            );
            await saveContacts(withCategories, IndexMapWith, INCLUDE);
            await saveContacts(withoutCategories, indexMapWithout, IGNORE);
            onFinish();
        };

        withLoading(importContacts());
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

    return (
        <>
            <Alert>
                {c('Description')
                    .t`Encrypting and importing contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-import-contacts"
                alt="contact-loader"
                value={percentageProgress(
                    model.encrypted.length,
                    model.failedOnParse.length + model.failedOnEncrypt.length,
                    model.total
                )}
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
