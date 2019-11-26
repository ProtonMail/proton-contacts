import React from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { useApi, useNotifications, useEventManager, useLoading, Alert, ErrorButton, FormModal } from 'react-components';

import { clearContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { allSucceded } from 'proton-shared/lib/api/helpers/response';

const DeleteModal = ({ beDeletedIDs, deleteAll, onDelete, ...rest }) => {
    const api = useApi();
    const { createNotification } = useNotifications();
    const { call } = useEventManager();
    const [loadingDelete, withLoadingDelete] = useLoading();

    const submit = <ErrorButton type="submit" loading={loadingDelete}>{c('Action').t`Delete`}</ErrorButton>;

    const handleDelete = async () => {
        if (deleteAll) {
            await api(clearContacts());
            onDelete();
            await call();
            rest.onClose();
            return createNotification({ text: c('Success').t`Contacts deleted` });
        }
        const apiSuccess = allSucceded(await api(deleteContacts(beDeletedIDs)));
        onDelete();
        await call();
        rest.onClose();
        if (!apiSuccess) {
            return createNotification({ text: c('Error').t`Some contacts could not be deleted`, type: 'warning' });
        }
        createNotification({
            text: c('Success').ngettext(msgid`Contact deleted`, `Contacts deleted`, beDeletedIDs.length)
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
                    beDeletedIDs.length
                )}
            </Alert>
        </FormModal>
    );
};

DeleteModal.propTypes = {
    beDeletedIDs: PropTypes.arrayOf(PropTypes.string),
    deleteAll: PropTypes.bool,
    onDelete: PropTypes.func
};

export default DeleteModal;
