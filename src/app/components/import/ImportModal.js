import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useNotifications,
    useUser,
    useUserKeys,
    useModals,
    FormModal,
    ConfirmModal,
    Alert,
    ResetButton,
    PrimaryButton
} from 'react-components';

import AttachingModalContent from './AttachingModalContent';
import ImportCsvModalContent from './ImportCsvModalContent';
import ImportingModalContent from './ImportingModalContent';
import ImportGroupsModalContent from './ImportGroupsModalContent';

import { hasCategories } from '../../helpers/import';
import { readCsv } from '../../helpers/csv';
import { readVcf } from '../../helpers/vcard';
import { BASE_SIZE } from 'proton-shared/lib/constants';
import { splitExtension } from 'proton-shared/lib/helpers/file';

const [ATTACHING, ATTACHED, CHECKING_CSV, IMPORTING, IMPORT_GROUPS] = [1, 2, 3, 4, 5];
const MAX_SIZE = 10 * BASE_SIZE ** 2; // 10 MB

const getI18nTitle = () => ({
    [ATTACHING]: c('Title').t`Import contacts`,
    [ATTACHED]: c('Title').t`Import contacts`,
    [CHECKING_CSV]: c('Title').t`Import CSV file`,
    [IMPORTING]: c('Title').t`Importing contacts`,
    [IMPORT_GROUPS]: c(`Title`).t`Import groups`
});

const ImportModal = ({ onClose, ...rest }) => {
    const title = getI18nTitle();

    const { createModal } = useModals();
    const { createNotification } = useNotifications();
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

    const [step, setStep] = useState(ATTACHING);
    const [file, setFile] = useState({});
    const [vcardContacts, setVcardContacts] = useState([]);
    const [encryptingDone, setEncryptingDone] = useState(false);

    const handleClear = () => {
        setFile({});
        setStep(ATTACHING);
    };

    const handleAttach = ({ target }) => {
        const ext = splitExtension(target.files[0].name)[1];
        const attachedFile = ['csv', 'vcf'].includes(ext) ? target.files[0] : null;

        if (target.files.length && !attachedFile) {
            return createNotification({
                type: 'error',
                text: c('Error notification').t`No .csv or .vcf file selected`
            });
        }
        if (attachedFile.size > MAX_SIZE) {
            return createModal(
                <ConfirmModal
                    onConfirm={handleClear}
                    onClose={handleClear}
                    confirm={c('Action').t`Go back`}
                    close={null}
                    title={c('Title').t`File is too big!`}
                >
                    <Alert type="error">{c('Error info')
                        .t`We only support importing files smaller than 10 MB. Please split your contacts into several smaller files.`}</Alert>
                </ConfirmModal>
            );
        }

        setStep(ATTACHED);
        setFile({ attached: attachedFile, ext });
    };

    const handleEncryptingDone = () => setEncryptingDone(true);

    const { content, ...modalProps } = (() => {
        if (step <= ATTACHED) {
            const handleSubmit = async () => {
                try {
                    if (file.ext === 'csv') {
                        const read = await readCsv(file.attached);
                        setFile({ ...file, read });
                        setStep(CHECKING_CSV);
                    } else {
                        const read = await readVcf(file.attached);
                        setFile({ ...file, read });
                        setStep(IMPORTING);
                    }
                } catch {
                    createNotification({
                        type: 'error',
                        text: c('Error notification').t`File selected appears to be corrupted`
                    });
                    setStep(ATTACHING);
                    handleClear();
                }
            };
            const footer = (
                <>
                    <ResetButton>{c('Action').t`Cancel`}</ResetButton>
                    <PrimaryButton disabled={step === ATTACHING} type="submit">
                        {c('Action').t`Import`}
                    </PrimaryButton>
                </>
            );

            return {
                content: (
                    <AttachingModalContent
                        attached={step === ATTACHED}
                        file={file.attached}
                        onAttach={handleAttach}
                        onClear={handleClear}
                    />
                ),
                footer,
                onSubmit: handleSubmit
            };
        }

        if (step === CHECKING_CSV) {
            const handleSubmit = () => setStep(IMPORTING);
            const footer = (
                <>
                    <ResetButton>{c('Action').t`Cancel`}</ResetButton>
                    <PrimaryButton disabled={!vcardContacts.length} type="submit">
                        {c('Action').t`Import`}
                    </PrimaryButton>
                </>
            );

            return {
                content: (
                    <ImportCsvModalContent
                        file={file.read}
                        vcardContacts={vcardContacts}
                        onSetVcardContacts={setVcardContacts}
                    />
                ),
                footer,
                onSubmit: handleSubmit
            };
        }

        if (step === IMPORTING) {
            const handleSubmit = () => {
                if (hasCategories(vcardContacts)) {
                    return setStep(IMPORT_GROUPS);
                }
                onClose();
            };
            const footer = (
                <PrimaryButton loading={!encryptingDone} type="submit">
                    {c('Action').t`Next`}
                </PrimaryButton>
            );

            return {
                content: (
                    <ImportingModalContent
                        fileExt={file.ext}
                        file={file.read}
                        vcardContacts={vcardContacts}
                        onSetVcardContacts={setVcardContacts}
                        loadingKeys={loadingUserKeys}
                        privateKey={userKeysList[0].privateKey}
                        onEncryptingDone={handleEncryptingDone}
                    />
                ),
                footer,
                hasClose: false,
                onSubmit: handleSubmit
            };
        }
        if (step === IMPORT_GROUPS) {
            const handleSubmit = onClose;
            const footer = <PrimaryButton type="submit">{c('Action').t`Create`}</PrimaryButton>;

            return {
                content: <ImportGroupsModalContent vcardContacts={vcardContacts} />,
                footer,
                onSubmit: handleSubmit
            };
        }
    })();

    return (
        <FormModal title={title[step]} onClose={onClose} {...modalProps} {...rest}>
            {content}
        </FormModal>
    );
};

ImportModal.propTypes = {
    onClose: PropTypes.func
};

export default ImportModal;
