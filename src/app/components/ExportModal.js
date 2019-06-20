import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useContacts,
    useUser,
    useUserKeys,
    useApi,
    FormModal,
    FooterModal,
    ResetButton,
    PrimaryButton,
    Alert
} from 'react-components';
import { getContact } from 'proton-shared/lib/api/contacts';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';

import { prepareContact, bothUserKeys } from '../helpers/cryptoTools';
import { toICAL } from '../helpers/vcard';
import DynamicProgress from './DynamicProgress';

const decryptContact = async (api, contactID, keys) => {
    try {
        const { Contact } = await api(getContact(contactID));
        const { properties, errors } = await prepareContact(Contact, bothUserKeys(keys));
        return properties;
    } catch (error) {
        throw error;
    }
};

const ExportFooter = ({ loading }) => {
    return (
        <>
            <ResetButton>{c('Action').t`Cancel`}</ResetButton>
            <PrimaryButton loading={loading} type="submit">
                {c('Action').t`Save`}
            </PrimaryButton>
        </>
    );
};

const ExportModal = ({ onSubmit, onClose, ...rest }) => {
    const api = useApi();
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);
    const { publicKeys, privateKeys } = bothUserKeys(userKeysList);
    const [contacts, loadingContacts] = useContacts();

    const [contactsExported, addSuccess] = useState([]);
    const [contactsNotExported, addError] = useState([]);

    const countContacts = LabelID
        ? contacts.filter(({ LabelIDs = [] }) => LabelIDs.includes(LabelID)).length
        : contacts.length;
    const apiCalls = Math.ceil(countContacts / QUERY_EXPORT_MAX_PAGESIZE);

    const handleSave = (vcards) => {
        const allVcards = vcards.join('\n');
        const blob = new Blob([allVcards], { type: 'data:text/plain;charset=utf-8;' });
        downloadFile(blob, 'protonContacts.vcf');
        onSubmit();
        onClose();
    };

    useEffect(() => {
        const exportContacts = () => {
            contacts.forEach(async ({ ID }, i) => {
                try {
                    const contactDecrypted = await decryptContact(api, ID, userKeysList);
                    const contactExported = toICAL(contactDecrypted).toString();
                    addSuccess((contactsExported) => [...contactsExported, contactExported]);
                } catch (error) {
                    addError((contactsNotExported) => [...contactsNotExported, ID]);
                    throw error;
                }
            });
        };
        exportContacts();
    }, []);

    return (
        <FormModal
            title={c('Title').t`Exporting contacts`}
            onSubmit={() => handleSave(contactsExported)}
            onClose={onClose}
            footer={ExportFooter({ loading: contactsExported.length + contactsNotExported.length !== countContacts })}
            loading={loadingUserKeys || loadingContacts}
            {...rest}
        >
            <Alert>
                {c('Description')
                    .t`Decrypting contacts... This may take a few minutes. When the process is completed, you will be able to download the file with all your contacts exported.`}
            </Alert>
            <DynamicProgress
                id="progress-contacts"
                alt="contact-loader"
                value={Math.round(((contactsExported.length + contactsNotExported.length) / contacts.length) * 100)}
                displayEnd={c('Progress bar description').t`${contactsExported.length} out of ${
                    contacts.length
                } contacts successfully exported.`}
            />
        </FormModal>
    );
};

ExportModal.propTypes = {
    onSubmit: PropTypes.func,
    onClose: PropTypes.func
};

export default ExportModal;
