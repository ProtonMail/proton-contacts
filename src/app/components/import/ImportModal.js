import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useEventManager,
    useNotifications,
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

// temporarily disabled
// import { haveCategories } from '../../helpers/import';
import { readCsv } from '../../helpers/csv';
import { readVcf } from 'proton-shared/lib/contacts/vcard';
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

const ImportModal = ({ userKeysList, ...rest }) => {
    const title = getI18nTitle();

    const { createModal } = useModals();
    const { createNotification } = useNotifications();
    const { call } = useEventManager();

    const [step, setStep] = useState(ATTACHING);
    const [file, setFile] = useState({});
    const [vcardContacts, setVcardContacts] = useState([]);
    const [importFinished, setImportFinished] = useState(false);

    const { content, ...modalProps } = (() => {
        if (step <= ATTACHED) {
            const submit = (
                <PrimaryButton disabled={step === ATTACHING} type="submit">
                    {c('Action').t`Import`}
                </PrimaryButton>
            );

            const handleClear = () => {
                setFile({});
                setStep(ATTACHING);
            };

            const handleAttach = ({ target }) => {
                const [, extension] = splitExtension(target.files[0].name);
                const attachedFile = ['csv', 'vcf'].includes(extension.toLowerCase()) ? target.files[0] : null;

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
                setFile({ attached: attachedFile, extension });
            };

            const handleSubmit = async () => {
                try {
                    if (file.extension === 'csv') {
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

            return {
                content: (
                    <AttachingModalContent
                        attached={step === ATTACHED}
                        file={file.attached}
                        onAttach={handleAttach}
                        onClear={handleClear}
                    />
                ),
                submit,
                onSubmit: handleSubmit
            };
        }

        if (step === CHECKING_CSV) {
            const submit = (
                <PrimaryButton disabled={!vcardContacts.length} type="submit">
                    {c('Action').t`Import`}
                </PrimaryButton>
            );

            const handleSubmit = () => setStep(IMPORTING);

            return {
                content: (
                    <ImportCsvModalContent
                        file={file.read}
                        vcardContacts={vcardContacts}
                        onSetVcardContacts={setVcardContacts}
                    />
                ),
                submit,
                onSubmit: handleSubmit
            };
        }

        if (step === IMPORTING) {
            const close = !importFinished && <ResetButton>{c('Action').t`Cancel`}</ResetButton>;
            const submit = (
                <PrimaryButton loading={!importFinished} type="submit">
                    {c('Action').t`Close`}
                </PrimaryButton>
            );

            const handleFinish = async () => {
                // temporarily disabled
                // if (haveCategories(vcardContacts)) {
                //     return setStep(IMPORT_GROUPS);
                // }
                await call();
                setImportFinished(true);
            };

            return {
                content: (
                    <ImportingModalContent
                        isVcf={file.extension === 'vcf'}
                        file={file.read}
                        vcardContacts={vcardContacts}
                        onSetVcardContacts={setVcardContacts}
                        privateKey={userKeysList[0].privateKey}
                        onFinish={handleFinish}
                    />
                ),
                close,
                submit,
                onSubmit: rest.onClose
            };
        }

        if (step === IMPORT_GROUPS) {
            const handleSubmit = async () => {
                await call();
                rest.onClose();
            };
            const submit = <PrimaryButton type="submit">{c('Action').t`Create`}</PrimaryButton>;

            return {
                content: <ImportGroupsModalContent vcardContacts={vcardContacts} />,
                submit,
                onSubmit: handleSubmit
            };
        }
    })();

    return (
        <FormModal title={title[step]} {...modalProps} {...rest}>
            {content}
        </FormModal>
    );
};

ImportModal.propTypes = {
    userKeysList: PropTypes.array.isRequired
};

export default ImportModal;
