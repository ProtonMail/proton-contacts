import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useNotifications, FormModal, useUser, useUserKeys } from 'react-components';

import ImportFooter from './ImportFooter';
import AttachingModalContent from './AttachingModalContent';
import ImportCsvModalContent from './ImportCsvModalContent';
import ImportingModalContent from './ImportingModalContent';
import ImportGroupsModalContent from './ImportGroupsModalContent';

import { noop } from 'proton-shared/lib/helpers/function';
import { IMPORT_STEPS } from '../../constants';

const { ATTACHING, ATTACHED, CHECKING_CSV, IMPORTING, IMPORT_GROUPS } = IMPORT_STEPS;

const getI18nTitle = {
    [ATTACHING]: c('Title').t`Import contacts`,
    [ATTACHED]: c('Title').t`Import contacts`,
    [CHECKING_CSV]: c('Title').t`Import CSV file`,
    [IMPORTING]: c('Title').t`Importing contacts`,
    [IMPORT_GROUPS]: c(`Title`).t`Import groups`
};

const ImportModal = ({ onClose, ...rest }) => {
    const { createNotification } = useNotifications();
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

    const [step, setStep] = useState(ATTACHING);
    const [importFile, setImportFile] = useState(null);
    const [vcardContacts, setVcardContacts] = useState([]);
    const [encryptingDone, setEncryptingDone] = useState(false);

    const handleAttach = async ({ target }) => {
        // TODO: set some limit on the total number of files or their size ?
        const file = [...target.files].filter(({ type }) => ['text/vcard', 'text/csv'].includes(type))[0];

        if (target.files.length && !file) {
            return createNotification({
                type: 'error',
                text: c('Error notification').t`No .csv or .vcf file selected`
            });
        }
        setStep(ATTACHED);
        setImportFile(file);
    };

    const handleClear = () => {
        setImportFile(null);
        setStep(ATTACHING);
    };

    const handleEncryptingDone = () => setEncryptingDone(true);

    const handleSubmit = {
        [ATTACHING]: () => noop,
        [ATTACHED]: () => setStep(importFile.type === 'text/csv' ? CHECKING_CSV : IMPORTING),
        [CHECKING_CSV]: () => {
            setStep(IMPORTING);
        },
        [IMPORTING]: () => setStep(IMPORT_GROUPS),
        [IMPORT_GROUPS]: onClose
    };

    return (
        <FormModal
            title={getI18nTitle[step]}
            onSubmit={handleSubmit[step]}
            onClose={onClose}
            footer={ImportFooter({ step, vcardContacts, encryptingDone })}
            {...rest}
        >
            {step <= ATTACHED ? (
                <AttachingModalContent
                    attached={step === ATTACHED}
                    file={importFile}
                    onAttach={handleAttach}
                    onClear={handleClear}
                />
            ) : step === CHECKING_CSV ? (
                <ImportCsvModalContent
                    file={importFile}
                    vcardContacts={vcardContacts}
                    onSetVcardContacts={setVcardContacts}
                />
            ) : step === IMPORTING ? (
                <ImportingModalContent
                    file={importFile}
                    vcardContacts={vcardContacts}
                    onSetVcardContacts={setVcardContacts}
                    loadingKeys={loadingUserKeys}
                    privateKey={userKeysList[0].privateKey}
                    encryptingDone={encryptingDone}
                    onEncryptingDone={handleEncryptingDone}
                />
            ) : (
                <ImportGroupsModalContent vcardContacts={vcardContacts} />
            )}
        </FormModal>
    );
};

ImportModal.propTypes = {
    onClose: PropTypes.func
};

export default ImportModal;
