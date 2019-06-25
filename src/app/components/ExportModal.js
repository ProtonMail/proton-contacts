import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useContacts,
    useUser,
    useUserKeys,
    useApi,
    FormModal,
    ResetButton,
    PrimaryButton,
    Alert
} from 'react-components';
import { queryContactExport } from 'proton-shared/lib/api/contacts';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';

import { decryptContactCards } from '../helpers/decrypt';
import { toICAL } from '../helpers/vcard';
import DynamicProgress from './DynamicProgress';

const DOWNLOAD_FILENAME = 'protonContacts.vcf';
// BACK-END DATA
const QUERY_EXPORT_MAX_PAGESIZE = 50;
const [API_SAFE_INTERVAL] = [100]; // API request limit: 100 requests / 10 seconds, so 1 request every 100 ms is safe

const apiTimeout = (ms = API_SAFE_INTERVAL) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const ExportFooter = ({ loading }) => {
    return (
        <>
            <ResetButton>{c('Action').t`Cancel`}</ResetButton>
            <PrimaryButton loading={loading} type="submit">
                {c('Action').t`Save`}
            </PrimaryButton>
        </>
    );
};

const ExportModal = ({ onClose, ...rest }) => {
    const api = useApi();
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);
    const [contacts, loadingContacts] = useContacts();

    const [contactsExported, addSuccess] = useState([]);
    const [contactsNotExported, addError] = useState([]);

    const countContacts = LabelID
        ? contacts.filter(({ LabelIDs = [] }) => LabelIDs.includes(LabelID)).length
        : contacts.length;
    const apiCalls = Math.ceil(countContacts / QUERY_EXPORT_MAX_PAGESIZE);

    const handleSave = (vcards) => {
        const allVcards = vcards.join('\n');
        const blob = new Blob([allVcards], { type: 'data:text/plain;charset=utf-8;' });
        downloadFile(blob, DOWNLOAD_FILENAME);
        onClose();
    };

    useEffect(() => {
        const apiCalls = Math.ceil(contacts.length / QUERY_EXPORT_MAX_PAGESIZE);

        const exportBatch = async (i) => {
            const batch = await api(queryContactExport({ Page: i, PageSize: QUERY_EXPORT_MAX_PAGESIZE }));
            batch.Contacts.forEach(async ({ ID, Cards }) => {
                try {
                    const contactDecrypted = await decryptContactCards(Cards, ID, userKeysList);
                    const contactExported = toICAL(contactDecrypted).toString();
                    addSuccess((contactsExported) => [...contactsExported, contactExported]);
                } catch (error) {
                    addError((contactsNotExported) => [...contactsNotExported, ID]);
                    throw error;
                }
            });
        };

        const exportContacts = async () => {
            for (let i = 0; i < apiCalls; i++) {
                await Promise.all([exportBatch(i), apiTimeout()]); // typically exportBatch will take longer than apiTimeout, but we include it 'just in case' to avoid API overload
            }
        };
        exportContacts();
    }, []);

    return (
        <FormModal
            title={c('Title').t`Exporting contacts`}
            onSubmit={() => handleSave(contactsExported)}
            onClose={onClose}
            footer={ExportFooter({ loading: contactsExported.length + contactsNotExported.length !== countContacts })}
            loading={loadingUserKeys || loadingContacts}
            {...rest}
        >
            <Alert>
                {c('Description')
                    .t`Decrypting contacts... This may take a few minutes. When the process is completed, you will be able to download the file with all your contacts exported.`}
            </Alert>
            <DynamicProgress
                id="progress-contacts"
                alt="contact-loader"
                value={Math.floor(((contactsExported.length + contactsNotExported.length) / contacts.length) * 100)}
                displayEnd={c('Progress bar description')
                    .t`${contactsExported.length} out of ${contacts.length} contacts successfully exported.`}
            />
        </FormModal>
    );
};

ExportModal.propTypes = {
    onClose: PropTypes.func
};

export default ExportModal;
