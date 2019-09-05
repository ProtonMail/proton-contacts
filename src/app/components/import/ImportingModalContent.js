import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { useApi, useLoading, Alert, Details, Summary, Bordered } from 'react-components';

import DynamicProgress from '../DynamicProgress';

import { addContacts } from 'proton-shared/lib/api/contacts';
import { extractVcards, parse as parseVcard } from '../../helpers/vcard';
import { prepareContact } from '../../helpers/encrypt';
import { percentageProgress } from '../../helpers/progress';
import { OVERWRITE, CATEGORIES, SUCCESS_IMPORT_CODE } from '../../constants';
import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';

const { OVERWRITE_CONTACT } = OVERWRITE;
const { IGNORE, INCLUDE } = CATEGORIES;
const { CLEAR_TEXT } = CONTACT_CARD_TYPE;

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
        // extract and parse contacts from a vcf file.
        // returns succesfully parsed vCard contacts and an indexMap to keep track of original contact order
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

        // encrypt vCard contacts. Returns succesfully encrypted contacts
        // and an indexMap to keep track of original contact order
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
                    let { errors } = acc;
                    if (contact === 'error') {
                        errors++;
                        return acc;
                    }
                    newIndexMap[i - errors] = indexMap[i];
                    return acc;
                },
                { newIndexMap: Object.create(null), errors: 0 }
            );

            return { encryptedContacts: encryptContacts.filter(Boolean), indexMap: newIndexMap };
        };

        const saveContacts = async (contacts, indexMap) => {
            // split encrypted contacts depending on having the CATEGORIES property
            const { withCategories, withoutCategories, newIndexMap, indexMapWithout } = contacts.reduce(
                (acc, { Cards }, i) => {
                    const { withCategories, withoutCategories, newIndexMap, indexMapWithout } = acc;
                    if (Cards.some(({ Type, Data }) => Type === CLEAR_TEXT && Data.includes('CATEGORIES'))) {
                        newIndexMap[withCategories.length] = indexMap[i];
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
                    newIndexMap: Object.create(null),
                    indexMapWithout: Object.create(null)
                }
            );
            // complete newIndexMap
            const shift = withCategories.length;
            for (const [i, mappedIndex] of Object.entries(indexMapWithout)) {
                newIndexMap[i + shift] = mappedIndex;
            }

            // send encrypted contacts to API
            const responses = (await api(
                addContacts({ Contacts: withCategories, Overwrite: OVERWRITE_CONTACT, Labels: INCLUDE })
            )).Responses.concat(
                (await api(addContacts({ Contacts: withoutCategories, Overwrite: OVERWRITE_CONTACT, Labels: IGNORE })))
                    .Responses
            ).map(({ Response }) => Response);

            const { imported, failedOnImport } = responses.reduce(
                (acc, { Code, Error }, i) => {
                    if (Code === SUCCESS_IMPORT_CODE) {
                        return { ...acc, imported: acc.imported + 1 };
                    }
                    return { ...acc, failedOnImport: [...acc.failedOnImport, { index: indexMap[i], Error }] };
                },
                { imported: 0, failedOnImport: [] }
            );
            setModel((model) => ({ ...model, imported, failedOnImport }));
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
            await saveContacts(encryptedContacts, updatedIndexMap);
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
    extension: PropTypes.oneOf(['csv', 'vcf']),
    file: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ headers: PropTypes.array, contacts: PropTypes.array })
    ]).isRequired,
    vcardContacts: PropTypes.array.isRequired,
    privateKey: PropTypes.object.isRequired,
    onFinish: PropTypes.func
};

export default ImportingModalContent;
