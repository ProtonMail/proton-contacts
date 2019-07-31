import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useModals, FormModal, ResetButton, PrimaryButton, Alert } from 'react-components';

import { move } from 'proton-shared/lib/helpers/array';

import MergeTable from './MergeTable';
import ContactDetails from './ContactDetails';
import MergeContactPreview from './MergeContactPreview';
import MergingModal from './MergingModal';

// helper to re-order arrays inside a list of arrays
const reOrderInGroup = (collection, groupIndex, { oldIndex, newIndex }) =>
    collection.map((group, i) => {
        if (i === groupIndex) {
            return move(group, oldIndex, newIndex);
        }
        return group;
    });

const MergeModal = ({ contacts, userKeysList, ...rest }) => {
    const { createModal } = useModals();

    const [model, setModel] = useState({
        orderedContacts: contacts,
        isChecked: contacts.map((group) => group.map(() => true)),
        isDeleted: contacts.map((group) => group.map(() => false))
    });

    const beMergedIDs = model.orderedContacts
        .map((group, i) =>
            group.map(({ ID }, j) => model.isChecked[i][j] && !model.isDeleted[i][j] && ID).filter(Boolean)
        )
        .filter((group) => group.length > 1);
    const beDeletedIDs = model.orderedContacts.map((group, i) =>
        group.map(({ ID }, j) => model.isDeleted[i][j] && ID).filter(Boolean)
    );

    const handleClickDetails = (contactID) => {
        createModal(<ContactDetails contactID={contactID} userKeysList={userKeysList} />);
    };

    const handleRemoveMerged = (groupIndex) => {
        setModel(({ orderedContacts, isChecked, isDeleted }) => ({
            orderedContacts: orderedContacts.filter((_group, i) => i !== groupIndex),
            isChecked: isChecked.filter((_group, i) => i !== groupIndex),
            isDeleted: isDeleted.filter((_group, i) => i !== groupIndex)
        }));
    };

    const handlePreview = (contactsIDs, groupIndex) => {
        createModal(
            <MergeContactPreview
                groupIndex={groupIndex}
                contactsIDs={contactsIDs}
                userKeysList={userKeysList}
                onMerge={handleRemoveMerged}
            />
        );
    };

    const handleMerge = (contactsIDs) => {
        createModal(<MergingModal contactsIDs={contactsIDs} userKeysList={userKeysList} beDeletedIDs={beDeletedIDs} />);
    };

    const handleToggleCheck = (groupIndex) => (index) => {
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

    const handleToggleDelete = (groupIndex) => (index) => {
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

    const handleSortEnd = (groupIndex) => ({ oldIndex, newIndex }) => {
        setModel({
            orderedContacts: reOrderInGroup(model.orderedContacts, groupIndex, { oldIndex, newIndex }),
            isChecked: reOrderInGroup(model.isChecked, groupIndex, { oldIndex, newIndex }),
            isDeleted: reOrderInGroup(model.isDeleted, groupIndex, { oldIndex, newIndex })
        });
    };

    return (
        <FormModal
            title={c('Title').t`Merge contacts`}
            footer={
                <>
                    <ResetButton>{c('Action').t`Cancel`}</ResetButton>
                    <PrimaryButton disabled={!beMergedIDs.length}>{c('Action').t`Merge`}</PrimaryButton>
                </>
            }
            onSubmit={() => handleMerge(beMergedIDs)}
            {...rest}
        >
            <Alert>
                {c('Description')
                    .jt`Use Drag and Drop to rank merging priority between contacts. Uncheck the contacts you do ${(
                    <b key="boldface">not</b>
                )} want to merge`}
            </Alert>
            <Alert type="warning">
                {c('Description')
                    .t`You can mark for deletion the contacts that you do not want neither to merge nor to keep.
                    Deletion will only take place after the merge button is clicked.`}
            </Alert>
            <MergeTable
                onSortEnd={handleSortEnd}
                contacts={model.orderedContacts}
                isChecked={model.isChecked}
                isDeleted={model.isDeleted}
                onClickCheckbox={handleToggleCheck}
                onClickDetails={handleClickDetails}
                onClickDelete={handleToggleDelete}
                onClickUndelete={handleToggleDelete}
                onClickPreview={handlePreview}
            />
        </FormModal>
    );
};

MergeModal.propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.array),
    userKeysList: PropTypes.array
};

export default MergeModal;
