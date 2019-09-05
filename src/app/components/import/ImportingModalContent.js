import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { Alert, useApi, useLoading } from 'react-components';

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
    const [model, setModel] = useState({
        total: vcardContacts.length,
        failedOnParse: 0,
        encrypted: [],
        failedOnEncrypt: [],
        imported: 0
    });

    useEffect(() => {
        // extract and parse contacts from a vcf file. Returns succesfully parsed vCard contacts
        const parseVcf = (vcf) => {
            const vcards = extractVcards(vcf);
            setModel({ ...model, total: vcards.length });

            return vcards
                .map((vcard) => {
                    try {
                        return parseVcard(vcard);
                    } catch {
                        setModel((model) => ({ ...model, failedOnParse: model.failedOnParse + 1 }));
                        return;
                    }
                })
                .filter(Boolean);
        };

        // encrypt vCard contacts. Returns succesfully encrypted contacts
        const encryptContacts = async (contacts) => {
            const publicKey = privateKey.toPublic();
            return (await Promise.all(
                contacts.map(async (contact) => {
                    try {
                        const contactEncrypted = await prepareContact(contact, privateKey, publicKey);
                        setModel((model) => ({ ...model, encrypted: [...model.encrypted, contactEncrypted] }));
                        return contactEncrypted;
                    } catch (error) {
                        setModel((model) => ({ ...model, failedOnEncrypt: [...model.failed, contact] }));
                        return;
                    }
                })
            )).filter(Boolean);
        };

        const saveContacts = async (contacts) => {
            // split encrypted contacts depending on having the CATEGORIES property
            const withCategories = contacts.filter(({ Cards }) =>
                Cards.some(({ Type, Data }) => Type === CLEAR_TEXT && Data.includes('CATEGORIES'))
            );
            const withoutCategories = contacts.filter(({ Cards }) =>
                Cards.every(({ Type, Data }) => Type !== CLEAR_TEXT || !Data.includes('CATEGORIES'))
            );

            // send encrypted contacts to API
            const responses = (await api(
                addContacts({ Contacts: withCategories, Overwrite: OVERWRITE_CONTACT, Labels: INCLUDE })
            )).Responses.concat(
                (await api(addContacts({ Contacts: withoutCategories, Overwrite: OVERWRITE_CONTACT, Labels: IGNORE })))
                    .Responses
            ).map(({ Response }) => Response);

            const imported = responses.reduce((acc, { Code }) => {
                if (Code === SUCCESS_IMPORT_CODE) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            setModel((model) => ({ ...model, imported }));
        };

        const importContacts = async () => {
            const parsedContacts = extension === 'vcf' ? parseVcf(file) : vcardContacts;
            const encryptedContacts = await encryptContacts(parsedContacts);
            await saveContacts(encryptedContacts);
            onFinish();
        };

        withLoading(importContacts());
    }, []);

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
                    model.failedOnParse + model.failedOnEncrypt.length,
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
