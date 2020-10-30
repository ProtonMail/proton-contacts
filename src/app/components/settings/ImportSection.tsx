import React from 'react';
import { c } from 'ttag';
import { PrimaryButton, Alert, useModals, Href } from 'react-components';
import ImportModal from '../import/ImportModal';

const ImportSection = () => {
    const { createModal } = useModals();
    const handleImport = () => createModal(<ImportModal />);
    return (
        <>
            <Alert>
                <span className="mr1">
                    {c('Info')
                        .t`We support importing CSV files from Outlook, Outlook Express, Yahoo! Mail, Hotmail, Eudora and some other apps. We also support importing vCard 4.0. (UTF-8 encoding).`}
                </span>
                <Href url="https://protonmail.com/support/knowledge-base/adding-contacts/">
                    {c('Link').t`Learn more`}
                </Href>
            </Alert>
            <div className="mb1">
                <PrimaryButton onClick={handleImport}>{c('Action').t`Import contacts`}</PrimaryButton>
            </div>
        </>
    );
};

export default ImportSection;
