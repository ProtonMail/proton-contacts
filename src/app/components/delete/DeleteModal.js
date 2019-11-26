import React from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { useApi, useNotifications, useEventManager, useLoading, Alert, ErrorButton, FormModal } from 'react-components';

import { clearContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { allSucceded } from 'proton-shared/lib/api/helpers/response';

const DeleteModal = ({
    activeIDs,
    contactID,
    contacts,
    filteredContacts,
    filteredCheckedIDs,
    onCheck,
    onClearSearch,
    onUpdateChecked,
    history,
    location,
    ...rest
}) => {
    const api = useApi();
    const { createNotification } = useNotifications();
    const { call } = useEventManager();
    const [loadingDelete, withLoadingDelete] = useLoading();

    const submit = <ErrorButton type="submit" loading={loadingDelete}>{c('Action').t`Delete`}</ErrorButton>;

    const handleDelete = async () => {
        if (activeIDs.length === contacts.length) {
            await api(clearContacts());
            history.replace({ ...location, pathname: '/contacts' });
            await call();
            onUpdateChecked(Object.create(null));
            rest.onClose();
            return createNotification({ text: c('Success').t`Contacts deleted` });
        }
        const apiSuccess = allSucceded(await api(deleteContacts(activeIDs)));
        if (activeIDs.length === filteredContacts.length) {
            onClearSearch();
        }
        if (contactID && activeIDs.includes(contactID)) {
            history.replace({ ...location, pathname: '/contacts' });
        }
        await call();
        onCheck(filteredCheckedIDs, false);
        rest.onClose();
        if (!apiSuccess) {
            return createNotification({ text: c('Error').t`Some contacts could not be deleted`, type: 'warning' });
        }
        createNotification({
            text: c('Success').ngettext(msgid`Contact deleted`, `Contacts deleted`, activeIDs.length)
        });
    };
    return (
        <FormModal
            title={c('Title').t`Delete`}
            onSubmit={() => withLoadingDelete(handleDelete())}
            submit={submit}
            loading={loadingDelete}
            {...rest}
        >
            <Alert type="warning">
                {c('Warning').ngettext(
                    msgid`This action will permanently delete the selected contact. Are you sure you want to delete this contact?`,
                    `This action will permanently delete selected contacts. Are you sure you want to delete these contacts?`,
                    activeIDs.length
                )}
            </Alert>
        </FormModal>
    );
};

DeleteModal.propTypes = {
    activeIDs: PropTypes.arrayOf(PropTypes.string),
    contactID: PropTypes.string,
    contacts: PropTypes.arrayOf(PropTypes.object),
    filteredContacts: PropTypes.arrayOf(PropTypes.object),
    filteredCheckedIDs: PropTypes.arrayOf(PropTypes.string),
    onCheck: PropTypes.func,
    onClearSearch: PropTypes.func,
    onUpdateChecked: PropTypes.func,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

export default DeleteModal;
