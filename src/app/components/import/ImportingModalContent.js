import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert, useApi } from 'react-components';

import DynamicProgress from '../DynamicProgress';

import { addContacts } from 'proton-shared/lib/api/contacts';
import { readFileAsString } from 'proton-shared/lib/helpers/file';
import { extractVcards, parse as parseVcard } from '../../helpers/vcard';
import { prepareContact } from '../../helpers/encrypt';
import { percentageProgress } from '../../helpers/progress';
import { OVERWRITE, SUCCESS_IMPORT_CODE } from '../../constants';

const { OVERWRITE_CONTACT } = OVERWRITE;

const ImportingModalContent = ({
    file,
    vcardContacts,
    onSetVcardContacts,
    loadingKeys,
    privateKey,
    encryptingDone,
    onEncryptingDone
}) => {
    const api = useApi();

    const [fileRead, setFileRead] = useState(false);
    const total = vcardContacts.length;
    const [encrypted, addSuccess] = useState([]);
    const [failed, addError] = useState([]);
    const [finished, setFinished] = useState(false);
    const [imported, setImported] = useState(0);

    useEffect(() => {
        const readFileIfNeeded = async () => {
            if (file.type === 'text/vcard') {
                const vcards = extractVcards(await readFileAsString(file));
                onSetVcardContacts(vcards.map(parseVcard));
            }
            // In this case the file has been already read,
            // and vcardContacts has been set too, in step CHECKING_CSV
            setFileRead(true);
        };

        readFileIfNeeded();
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

        !loadingKeys && fileRead && encryptContacts();
    }, [loadingKeys, fileRead]);

    useEffect(() => {
        const importContacts = async () => {
            const { Responses } = await api(
                addContacts({ Contacts: encrypted, Overwrite: OVERWRITE_CONTACT, Labels: 0 })
            );
            setImported(
                Responses.reduce((acc, { Code }) => {
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

    return (
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
    );
};

ImportingModalContent.propTypes = {
    file: PropTypes.instanceOf(File).isRequired,
    vcardContacts: PropTypes.array.isRequired,
    onSetVcardContacts: PropTypes.func,
    loadingKeys: PropTypes.bool,
    privateKey: PropTypes.object.isRequired,
    encryptingDone: PropTypes.bool,
    onEncryptingDone: PropTypes.func
};

export default ImportingModalContent;
