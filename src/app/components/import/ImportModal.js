import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useNotifications, FormModal, useUser, useUserKeys } from 'react-components';

import ImportFooter from './ImportFooter';
import AttachingModalContent from './AttachingModalContent';
import ImportCsvModalContent from './ImportCsvModalContent';
import ImportingModalContent from './ImportingModalContent';
import ImportGroupsModalContent from './ImportGroupsModalContent';

import { IMPORT_STEPS } from '../../constants';
import { hasCategories } from '../../helpers/import';
import { readCsv } from '../../helpers/csv';
import { readFileAsString } from 'proton-shared/lib/helpers/file';

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
    const [file, setFile] = useState({ attached: null, read: null });
    const [vcardContacts, setVcardContacts] = useState([]);
    const [encryptingDone, setEncryptingDone] = useState(false);

    const handleAttach = async ({ target }) => {
        // TODO: set some limit on the the size ?
        const attachedFile = [...target.files].filter(({ type }) => ['text/vcard', 'text/csv'].includes(type))[0];

        if (target.files.length && !attachedFile) {
            return createNotification({
                type: 'error',
                text: c('Error notification').t`No .csv or .vcf file selected`
            });
        }
        setStep(ATTACHED);
        setFile({ ...file, attached: attachedFile });
    };

    const handleClear = () => {
        setFile({ attached: null, read: null });
        setStep(ATTACHING);
    };

    const handleEncryptingDone = () => setEncryptingDone(true);

    const handleSubmit = {
        [ATTACHED]: async () => {
            try {
                if (file.attached.type === 'text/csv') {
                    setFile({ ...file, read: await readCsv(file.attached) });
                    setStep(CHECKING_CSV);
                } else {
                    setFile({ ...file, read: await readFileAsString(file.attached) });
                    setStep(IMPORTING);
                }
            } catch {
                createNotification({
                    type: 'error',
                    text: c('Error notification').t`File selected appears to be corrupted`
                });
                setStep(ATTACHING);
            }
        },
        [CHECKING_CSV]: () => {
            setStep(IMPORTING);
        },
        [IMPORTING]: () => {
            if (hasCategories(vcardContacts)) {
                return setStep(IMPORT_GROUPS);
            }
            onClose();
        },
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
                    file={file.attached}
                    onAttach={handleAttach}
                    onClear={handleClear}
                />
            ) : step === CHECKING_CSV ? (
                <ImportCsvModalContent
                    file={file.read}
                    vcardContacts={vcardContacts}
                    onSetVcardContacts={setVcardContacts}
                />
            ) : step === IMPORTING ? (
                <ImportingModalContent
                    fileType={file.attached.type}
                    file={file.read}
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
