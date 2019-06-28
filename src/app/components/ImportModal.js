import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useContacts,
    useUser,
    useUserKeys,
    useApi,
    useNotifications,
    Bordered,
    Row,
    FormModal,
    Icon,
    Button,
    ResetButton,
    PrimaryButton,
    FileInput,
    Alert
} from 'react-components';
import { queryContactExport } from 'proton-shared/lib/api/contacts';

import AttachedFile from './AttachedFile';

import { decryptContactCards } from '../helpers/decrypt';
import { toICAL } from '../helpers/vcard';

const ImportFooter = ({ disabled }) => {
    return (
        <>
            <ResetButton>{c('Action').t`Cancel`}</ResetButton>
            <PrimaryButton disabled={disabled} type="submit">
                {c('Action').t`Import`}
            </PrimaryButton>
        </>
    );
};

const ImportModal = ({ onClose, ...rest }) => {
    const [attached, setAttached] = useState(false);
    const [importFiles, setImportFiles] = useState([]);
    const { createNotification } = useNotifications();

    const handleAttach = ({ target }) => {
        const files = [...target.files].filter(({ type }) => ['text/vcard', 'text/csv'].includes(type));
        console.log(files);

        if (!files.length) {
            return createNotification({
                type: 'error',
                text: c('Error notification').t`No .csv or .vcard files selected`
            });
        }
        // TODO: set some limit on the total number of files or their size ?

        setAttached(files.length !== 0);
        setImportFiles(files);
    };

    const handleClear = (files, index) => {
        setImportFiles(files.filter((item, i) => i !== index));
        files.length === 1 && setAttached(false);
    };

    const handleSave = () => {
        onClose();
    };

    return (
        <FormModal
            title={c('Title').t`Import contacts`}
            submit={c('Action').t`Import`}
            onSubmit={() => handleSave()}
            onClose={onClose}
            footer={ImportFooter({ disabled: !attached })}
            {...rest}
        >
            <Alert learnMore="https://protonmail.com/support/knowledge-base/adding-contacts/">
                {c('Description')
                    .t`We support importing CSV files from Outlook, Outlook Express, Yahoo! Mail, Hotmail, Eudora and some other apps. We also support importing vCard. (UTF-8 encoding).`}
            </Alert>
            <Bordered className="flex">
                {/* TODO: drag&drop component here. There seems to be no React component for this kind of behavior yet */}
                {attached ? (
                    <AttachedFile files={importFiles} iconName="contacts-groups" onClear={handleClear} />
                ) : (
                    <FileInput
                        className="center"
                        multiple
                        accept=".csv, .vcard"
                        id="import-contacts"
                        onChange={handleAttach}
                    >
                        {c('Action').t`Select file from computer`}
                    </FileInput>
                )}
            </Bordered>
        </FormModal>
    );
};

ImportModal.propTypes = {
    onClose: PropTypes.func
};

export default ImportModal;
