import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Bordered, FileInput, Alert } from 'react-components';

import AttachedFiles from './AttachedFiles';

const AttachingModalContent = ({ attached, files, onAttach, onClear }) => {
    return (
        <>
            <Alert learnMore="https://protonmail.com/support/knowledge-base/adding-contacts/">
                {c('Description')
                    .t`We support importing CSV files from Outlook, Outlook Express, Yahoo! Mail, Hotmail, Eudora and some other apps. We also support importing vCard. (UTF-8 encoding).`}
            </Alert>
            <Bordered className="flex">
                {/* TODO: drag&drop component here. There seems to be no React component for this kind of behavior yet */}
                {attached ? <AttachedFiles files={files} iconName="contacts-groups" onClear={onClear} /> : null}
                <FileInput
                    className="center"
                    multiple
                    accept=".csv, .vcf"
                    id="import-contacts"
                    onChange={(e) => onAttach(e, files)}
                >
                    {c('Action').t`Select file from computer`}
                </FileInput>
            </Bordered>
        </>
    );
};

AttachingModalContent.propTypes = {
    attached: PropTypes.bool.isRequired,
    files: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, size: PropTypes.number })),
    onAttach: PropTypes.func,
    onClear: PropTypes.func
};

AttachingModalContent.PropTypes = {
    files: []
};

export default AttachingModalContent;
