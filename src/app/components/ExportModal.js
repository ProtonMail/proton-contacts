import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import moment from 'moment';
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
import { wait } from 'proton-shared/lib/helpers/promise';

import { bothUserKeys, prepareContact } from '../helpers/decrypt';
import { toICAL } from '../helpers/vcard';
import { percentageProgress } from './../helpers/progress';
import DynamicProgress from './DynamicProgress';

const DOWNLOAD_FILENAME = `protonContacts-${moment().format('YYYY-MM-DD')}.vcf`;
// BACK-END DATA
const QUERY_EXPORT_MAX_PAGESIZE = 50;
const API_SAFE_INTERVAL = 100; // API request limit: 100 requests / 10 seconds, so 1 request every 100 ms is safe

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

ExportFooter.propTypes = {
    loading: PropTypes.bool
};

const ExportModal = ({ onClose, ...rest }) => {
    const api = useApi();
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);
    const { publicKeys, privateKeys } = bothUserKeys(userKeysList);
    const [contacts, loadingContacts] = useContacts();

    const [contactsExported, addSuccess] = useState([]);
    const [contactsNotExported, addError] = useState([]);

    const handleSave = (vcards) => {
        const allVcards = vcards.join('\n');
        const blob = new Blob([allVcards], { type: 'data:text/plain;charset=utf-8;' });
        downloadFile(blob, DOWNLOAD_FILENAME);
        onClose();
    };

    useEffect(() => {
        const abortController = new AbortController();
        const apiWithAbort = (config) => api({ ...config, signal: abortController.signal });

        const apiCalls = Math.ceil(contacts.length / QUERY_EXPORT_MAX_PAGESIZE);

        const exportBatch = async (i, { signal }) => {
            const { Contacts: contacts } = await apiWithAbort(
                queryContactExport({ Page: i, PageSize: QUERY_EXPORT_MAX_PAGESIZE })
            );
            for (const { Cards, ID } of contacts) {
                if (signal.aborted) {
                    return;
                }
                try {
                    const { properties: contactDecrypted = [], errors = [] } = await prepareContact(
                        { Cards },
                        { publicKeys, privateKeys }
                    );

                    if (errors.length) {
                        throw new Error('Error decrypting contact');
                    }

                    const contactExported = toICAL(contactDecrypted).toString();
                    /*
                        need to check again for signal.aborted because the abort
                        may have taken place during await decryptContactCards
                    */
                    !signal.aborted && addSuccess((contactsExported) => [...contactsExported, contactExported]);
                } catch (error) {
                    /*
                        need to check again for signal.aborted because the abort
                        may have taken place during await decryptContactCards
                    */
                    !signal.aborted && addError((contactsNotExported) => [...contactsNotExported, ID]);
                }
            }
        };

        const exportContacts = async (abortController) => {
            for (let i = 0; i < apiCalls; i++) {
                /*
                    typically exportBatch will take longer than apiTimeout, but we include it
                    to avoid API overload it just in case exportBatch is too fast
                */
                await Promise.all([exportBatch(i, abortController), wait(API_SAFE_INTERVAL)]);
            }
        };

        exportContacts(abortController).catch((error) => {
            if (error.name !== 'AbortError') {
                onClose(); // close the modal; otherwise it is left hanging in there
                throw error;
            }
        });

        return () => {
            abortController.abort();
        };
    }, []);

    return (
        <FormModal
            title={c('Title').t`Exporting contacts`}
            onSubmit={() => handleSave(contactsExported)}
            onClose={onClose}
            footer={ExportFooter({ loading: contactsExported.length + contactsNotExported.length !== contacts.length })}
            loading={loadingUserKeys || loadingContacts}
            {...rest}
        >
            <Alert>
                {c('Description')
                    .t`Decrypting contacts... This may take a few minutes. When the process is completed, you will be able to download the file with all your contacts exported.`}
            </Alert>
            <DynamicProgress
                id="progress-export-contacts"
                alt="contact-loader"
                value={percentageProgress(contactsExported.length, contactsNotExported.length, contacts.length)}
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
