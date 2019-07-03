import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Bordered, FileInput, Alert } from 'react-components';

import AttachedFile from './AttachedFile';

const AttachingModalContent = ({ attached, file, onAttach, onClear }) => {
    return (
        <>
            <Alert learnMore="https://protonmail.com/support/knowledge-base/adding-contacts/">
                {c('Description')
                    .t`We support importing CSV files from Outlook, Outlook Express, Yahoo! Mail, Hotmail, Eudora and some other apps. We also support importing vCard. (UTF-8 encoding).`}
            </Alert>
            <Bordered className="flex">
                {/* TODO: drag&drop component here. There seems to be no React component for this kind of behavior yet */}
                {attached ? (
                    <AttachedFile file={file} iconName="contacts-groups" onClear={onClear} />
                ) : (
                    <FileInput className="center" accept=".csv, .vcf" id="import-contacts" onChange={onAttach}>
                        {c('Action').t`Select file from computer`}
                    </FileInput>
                )}
            </Bordered>
        </>
    );
};

AttachingModalContent.propTypes = {
    attached: PropTypes.string.isRequired,
    files: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, size: PropTypes.number })),
    onAttach: PropTypes.func,
    onClear: PropTypes.func
};

AttachingModalContent.PropTypes = {
    files: []
};

export default AttachingModalContent;
