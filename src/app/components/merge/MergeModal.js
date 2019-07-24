import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useApi,
    useModals,
    useNotifications,
    useEventManager,
    FormModal,
    Alert,
    Table,
    TableCell
} from 'react-components';

import { deleteContacts } from 'proton-shared/lib/api/contacts';
import { SUCCESS_IMPORT_CODE } from '../../constants';

import MergeTableBody from './MergeTableBody';
import ContactDetails from './ContactDetails';

const MergeTableHeader = () => {
    return (
        <thead>
            <tr>
                <TableCell type="header" className="w30">{c('TableHeader').t`NAME`}</TableCell>
                <TableCell type="header">{c('TableHeader').t`ADDRESS`}</TableCell>
                <TableCell type="header" className="w20">
                    {c('TableHeader').t`ACTIONS`}
                </TableCell>
            </tr>
        </thead>
    );
};

const MergeModal = ({ contacts, hasPaidMail, userKeysList, ...rest }) => {
    const api = useApi();
    const { createModal } = useModals();
    const { createNotification } = useNotifications();
    const { call } = useEventManager();
    const [model, setModel] = useState({
        order: contacts.map((group) => group.map((_contact, index) => index)),
        isChecked: contacts.map((group) => group.map(() => true)),
        isDeleted: contacts.map((group) => group.map(() => false))
    });

    const handleClickDetails = async (contactID) => {
        createModal(<ContactDetails contactID={contactID} hasPaidMail={hasPaidMail} userKeysList={userKeysList} />);
    };

    const handleToggleCheck = (groupIndex, index) => {
        setModel({
            ...model,
            isChecked: model.isChecked.map((group, i) => {
                if (i !== groupIndex) {
                    return group;
                }
                return group.map((bool, j) => (index === j ? !bool : bool));
            })
        });
    };

    const handleToggleDelete = (groupIndex, index) => {
        setModel({
            ...model,
            isDeleted: model.isDeleted.map((group, i) => {
                if (i !== groupIndex) {
                    return group;
                }
                return group.map((bool, j) => (index === j ? !bool : bool));
            })
        });
    };

    return (
        <FormModal title={c('Title').t`Merge contacts`} submit={c('Action').t`Merge`} {...rest}>
            <Alert>
                {c('Description')
                    .jt`Use Drag and Drop to rank merging priority between contacts. Uncheck the contacts you do ${(
                    <b key="boldface">not</b>
                )} want to merge`}
            </Alert>
            <Alert type="warning">
                {c('Description')
                    .t`You can mark for deletion the contacts that you do not want neither to merge nor to keep.
                    Deletion will only take place after the merge process.`}
            </Alert>
            <Table>
                <MergeTableHeader />
                <MergeTableBody
                    contacts={contacts}
                    isChecked={model.isChecked}
                    isDeleted={model.isDeleted}
                    onClickCheckbox={handleToggleCheck}
                    onClickDetails={handleClickDetails}
                    onClickDelete={handleToggleDelete}
                    onClickUndelete={handleToggleDelete}
                />
            </Table>
        </FormModal>
    );
};

MergeModal.propTypes = {
    contacts: PropTypes.array,
    hasPaidMail: PropTypes.number,
    userKeysList: PropTypes.array
};

export default MergeModal;
