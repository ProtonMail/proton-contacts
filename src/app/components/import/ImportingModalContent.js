import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert, useApi } from 'react-components';

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

const ImportingModalContent = ({
    fileType,
    file,
    vcardContacts,
    onSetVcardContacts,
    loadingKeys,
    privateKey,
    encryptingDone,
    onEncryptingDone
}) => {
    const api = useApi();

    const [fileParsed, setFileParsed] = useState(false);
    const total = vcardContacts.length;
    const [encrypted, addSuccess] = useState([]);
    const [failed, addError] = useState([]);
    const [finished, setFinished] = useState(false);
    const [imported, setImported] = useState(0);

    useEffect(() => {
        const parseFileIfNeeded = async () => {
            if (fileType === 'text/vcard') {
                const vcards = extractVcards(file);
                onSetVcardContacts(vcards.map(parseVcard));
            }
            // in the case of a csv file, the parsing has occurred in the previous step
            setFileParsed(true);
        };

        parseFileIfNeeded();
    }, []);

    useEffect(() => {
        const encryptContacts = async () => {
            const publicKey = privateKey.toPublic();
            for (const vcardContact of vcardContacts) {
                try {
                    const contactEncrypted = await prepareContact(vcardContact, privateKey, publicKey);
                    addSuccess((encrypted) => [...encrypted, contactEncrypted]);
                } catch (error) {
                    addError((failed) => [...failed, vcardContact]);
                }
            }
            onEncryptingDone();
        };

        !loadingKeys && fileParsed && encryptContacts();
    }, [loadingKeys, fileParsed]);

    useEffect(() => {
        const importContacts = async () => {
            // split encrypted contacts depending on having the CATEGORIES property
            const withCategories = encrypted.filter(({ Cards }) =>
                Cards.some(({ Type, Data }) => Type === CLEAR_TEXT && Data.includes('CATEGORIES'))
            );
            const withoutCategories = encrypted.filter(({ Cards }) =>
                Cards.every(({ Type, Data }) => Type !== CLEAR_TEXT || !Data.includes('CATEGORIES'))
            );

            // send encrypted contacts to API
            const responses = (await api(
                addContacts({ Contacts: withCategories, Overwrite: OVERWRITE_CONTACT, Labels: INCLUDE })
            )).Responses.concat(
                (await api(addContacts({ Contacts: withoutCategories, Overwrite: OVERWRITE_CONTACT, Labels: IGNORE })))
                    .Responses
            ).map(({ Response }) => Response);

            setImported(
                responses.reduce((acc, { Code }) => {
                    if (Code === SUCCESS_IMPORT_CODE) {
                        return acc + 1;
                    }
                    return acc;
                }, 0)
            );
            setFinished(true);
        };

        encryptingDone && importContacts();
    }, [encryptingDone]);

    return fileParsed ? (
        <>
            <Alert>
                {c('Description')
                    .t`Encrypting and importing contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-import-contacts"
                alt="contact-loader"
                value={percentageProgress(encrypted.length, failed.length, total)}
                displayEnd={c('Progress bar description')
                    .t`${imported} out of ${total} contacts successfully imported.`}
                endPostponed={!finished}
            />
        </>
    ) : null;
};

ImportingModalContent.propTypes = {
    fileType: PropTypes.oneOf(['text/csv', 'text/vcard']),
    file: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ headers: PropTypes.array, contacts: PropTypes.array })
    ]).isRequired,
    vcardContacts: PropTypes.array.isRequired,
    onSetVcardContacts: PropTypes.func,
    loadingKeys: PropTypes.bool,
    privateKey: PropTypes.object.isRequired,
    encryptingDone: PropTypes.bool,
    onEncryptingDone: PropTypes.func
};

export default ImportingModalContent;
