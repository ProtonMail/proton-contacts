import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useNotifications,
    useUser,
    useUserKeys,
    useApi,
    FormModal,
    ResetButton,
    PrimaryButton
} from 'react-components';

import AttachingModalContent from './AttachingModalContent';
import ImportingModalContent from './ImportingModalContent';

import { addContacts } from 'proton-shared/lib/api/contacts';
import { readFileAsString } from 'proton-shared/lib/helpers/file';
import { extractVcards, parse as parseVcard } from '../helpers/vcard';
import { prepareVcard } from '../helpers/decrypt';
import { extractCsvContacts, parse as parseCsvContact } from '../helpers/csv';

const AttachingFooter = ({ disabled }) => {
    return (
        <>
            <ResetButton>{c('Action').t`Cancel`}</ResetButton>
            <PrimaryButton disabled={disabled} type="submit">
                {c('Action').t`Import`}
            </PrimaryButton>
        </>
    );
};

const ImportingFooter = ({ loading }) => {
    return (
        <>
            <PrimaryButton loading={loading} type="submit">
                {c('Action').t`Close`}
            </PrimaryButton>
        </>
    );
};

const ImportModal = ({ onClose, ...rest }) => {
    const api = useApi();
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);
    const { createNotification } = useNotifications();

    const [attached, setAttached] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importFile, setImportFile] = useState(null);

    const [totalContacts, setTotalContacts] = useState(0);
    const [contactsImported, addSuccess] = useState([]);
    const [contactsNotImported, addError] = useState([]);

    const handleAttach = async ({ target }) => {
        // TODO: set some limit on the total number of files or their size ?
        const file = [...target.files].filter(({ type }) => ['text/vcard', 'text/csv'].includes(type))[0];

        if (target.files.length && !file) {
            return createNotification({
                type: 'error',
                text: c('Error notification').t`No .csv or .vcard file selected`
            });
        }
        setAttached(file.type);
        setImportFile(file);
    };

    const handleClear = () => {
        setImportFile(null);
        setAttached('');
    };

    const handleStartImport = () => setIsImporting(true);

    useEffect(() => {
        const setup = async () => {
            // read files, count contacts and extract their vcard properties
            const contactsProperties = [];

            for (const file of importFiles) {
                if (file.type == 'text/vcard') {
                    const vcards = extractVcards(await readFileAsString(file));
                    setTotalContacts((totalContacts) => totalContacts + vcards.length);
                    vcards.forEach((vcard) => contactsProperties.push(parseVcard(vcard)));
                }
                if (file.type == 'text/csv') {
                    const { values: contactValues } = extractCsvContacts(file);
                    setTotalContacts((totalContacts) => totalContacts + contactValues.length);
                    contactsProperties.concat(parseCsvContacts(contactValues));
                }
            }

            // encrypt contacts
            for (const vcard of vcards) {
                try {
                    const contactImported = prepareVcard(vcard, userKeysList);
                    addSuccess((contactsImported) => [...contactsImported, contactImported]);
                } catch (error) {
                    addError((contactsNotImported) => [...contactsNotImported, vcard]);
                }
            }

            // send contacts to back-end
            await api(addContacts(contactsImported));
        };

        isImporting && setup();
    }, [isImporting]);

    return (
        <FormModal
            title={!isImporting ? c('Title').t`Import contacts` : c('Title').t`Importing contacts`}
            onSubmit={!isImporting ? handleStartImport : onClose}
            onClose={onClose}
            footer={
                !isImporting
                    ? AttachingFooter({ disabled: attached === '' })
                    : ImportingFooter({
                          loading:
                              totalContacts === 0 ||
                              contactsImported.length + contactsNotImported.length !== totalContacts
                      })
            }
            {...rest}
        >
            {!isImporting ? (
                <AttachingModalContent
                    attached={attached}
                    file={importFile}
                    onAttach={handleAttach}
                    onClear={handleClear}
                />
            ) : (
                <ImportingModalContent
                    imported={contactsImported.length}
                    notImported={contactsNotImported.length}
                    total={totalContacts}
                />
            )}
        </FormModal>
    );
};

ImportModal.propTypes = {
    onClose: PropTypes.func
};

export default ImportModal;
