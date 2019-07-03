import React from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import {
    FormModal,
    PrimaryButton,
    useApi,
    DropdownActions,
    TableHeader,
    TableBody,
    TableRow,
    Table,
    ConfirmModal,
    Alert,
    useNotifications,
    useContactGroups,
    useEventManager,
    useContactEmails,
    useModals
} from 'react-components';
import { deleteLabel } from 'proton-shared/lib/api/labels';

import ContactGroupModal from './ContactGroupModal';
import ContactGroupIcon from './ContactGroupIcon';

const ContactGroupsTable = ({ onClose }) => {
    const [contactGroups] = useContactGroups();
    const [contactEmails] = useContactEmails();
    const { createNotification } = useNotifications();
    const { createModal } = useModals();
    const api = useApi();
    const { call } = useEventManager();

    const handleConfirmDeletion = (ID) => async () => {
        await api(deleteLabel(ID));
        await call();
        createNotification({
            text: c('Contact group notification').t`Contact group removed`
        });
    };

    const header = [c('Table header').t`Name`, c('Table header').t`Group size`, c('Table header').t`Actions`];

    return (
        <Table className="noborder">
            <TableHeader cells={header} />
            <TableBody>
                {contactGroups.map(({ ID, Name, Color }) => {
                    const countMembers = contactEmails.filter(({ LabelIDs = [] }) => LabelIDs.includes(ID)).length;
                    const list = [
                        {
                            text: c('Action').t`Edit`,
                            onClick() {
                                onClose();
                                createModal(<ContactGroupModal contactGroupID={ID} />);
                            }
                        },
                        {
                            text: c('Action').t`Delete`,
                            onClick() {
                                createModal(
                                    <ConfirmModal
                                        onConfirm={handleConfirmDeletion(ID)}
                                        title={c('Title').t`Delete contact group`}
                                    >
                                        <Alert type="warning">
                                            <p>{c('Info').t`Are you sure you want to delete this contact group?`}</p>
                                            <p>{c('Info')
                                                .t`Contacts in the group aren't deleted if the contact group is deleted.`}</p>
                                        </Alert>
                                    </ConfirmModal>
                                );
                            }
                        }
                    ];
                    const cells = [
                        <div key={ID} className="flex">
                            <span className="ellipsis">
                                <ContactGroupIcon name={Name} color={Color} /> {Name}
                            </span>
                        </div>,
                        c('Info').ngettext(msgid`${countMembers} member`, `${countMembers} members`, countMembers),
                        <DropdownActions key={ID} className="pm-button--small" list={list} />
                    ];
                    return <TableRow key={ID} cells={cells} />;
                })}
            </TableBody>
        </Table>
    );
};

ContactGroupsTable.propTypes = {
    onClose: PropTypes.func
};

const ContactGroupsModal = (props) => {
    const { createModal } = useModals();

    const handleCreate = () => {
        props.onClose();
        createModal(<ContactGroupModal />);
    };

    return (
        <FormModal title={c('Title').t`Manage groups`} close={c('Action').t`Close`} hasSubmit={false} {...props}>
            <div className="mb1">
                <PrimaryButton onClick={handleCreate}>{c('Action').t`Add group`}</PrimaryButton>
            </div>
            <ContactGroupsTable onClose={props.onClose} />
        </FormModal>
    );
};

ContactGroupsModal.propTypes = {
    onClose: PropTypes.func
};

export default ContactGroupsModal;
