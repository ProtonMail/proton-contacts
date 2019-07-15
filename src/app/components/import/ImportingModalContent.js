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

const ImportingModalContent = ({ file, vcardContacts, loadingKeys, privateKey, encryptingDone, onEncryptingDone }) => {
    const api = useApi();

    const total = vcardContacts.length;
    const [encrypted, addSuccess] = useState([]);
    const [failed, addError] = useState([]);

    useEffect(() => {
        const encryptContacts = async () => {
            if (file.type == 'text/vcard') {
                const vcards = extractVcards(await readFileAsString(file));
                setVcardContacts(vcards.map(parseVcard));
            }
            // if importFile.type == 'text/csv', vcardContacts has been set in step CHECKING_CSV

            // encrypt contacts
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

        !loadingKeys && encryptContacts();
    }, [loadingKeys]);

    useEffect(() => {
        const importContacts = async () => {
            if (encryptingDone) {
                console.log(encrypted);
                const apiResponse = await api(addContacts({ Contacts: encrypted, Overwrite: 1, Labels: 0 }));
                console.log('apiResponse', apiResponse);
            }
        };

        importContacts();
    }, [encryptingDone]);

    return (
        <>
            <Alert>
                {c('Description')
                    .t`Importing contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-import-contacts"
                alt="contact-loader"
                value={percentageProgress(encrypted.length, failed.length, total)}
                displayEnd={c('Progress bar description')
                    .t`${encrypted.length} out of ${total} contacts successfully imported.`}
            />
        </>
    );
};

ImportingModalContent.propTypes = {
    file: PropTypes.shape({ type: PropTypes.string }).isRequired,
    vcardContacts: PropTypes.array.isRequired,
    loadingKeys: PropTypes.bool,
    privateKey: PropTypes.object.isRequired,
    encryptingDone: PropTypes.bool,
    onEncryptingDone: PropTypes.func
};

export default ImportingModalContent;
