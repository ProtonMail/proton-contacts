import React, { ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Bordered, FileInput, Alert, AttachedFile } from 'react-components';
import { MAX_IMPORT_FILE_SIZE_STRING, MAX_IMPORT_CONTACTS_STRING } from '../../constants';
import { ImportContactsModel } from '../../interfaces/Import';

interface Props {
    model: ImportContactsModel;
    onAttach: (event: ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}
const AttachingModalContent = ({ model, onAttach, onClear }: Props) => {
    const alert = model.failure ? (
        <Alert type="error">{model.failure?.message}</Alert>
    ) : (
        <Alert learnMore="https://protonmail.com/support/knowledge-base/adding-contacts/">
            {c('Description').t`We support importing CSV files from Outlook, Outlook Express, Yahoo! Mail, Hotmail,
                Eudora and some other apps. We also support importing vCard 4.0. (UTF-8 encoding).
                The file should have a maximum size of ${MAX_IMPORT_FILE_SIZE_STRING} and have
                up to ${MAX_IMPORT_CONTACTS_STRING} contacts. If your file is bigger, please split it into smaller files.`}
        </Alert>
    );
    return (
        <>
            {alert}
            <Bordered className="flex">
                {/* TODO: drag&drop component here. There seems to be no React component for this kind of behavior yet */}
                {model.fileAttached ? (
                    <AttachedFile file={model.fileAttached} iconName="contacts-groups" onClear={onClear} />
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
    attached: PropTypes.bool,
    file: PropTypes.instanceOf(File),
    onAttach: PropTypes.func,
    onClear: PropTypes.func
};

AttachingModalContent.PropTypes = {
    files: []
};

export default AttachingModalContent;
