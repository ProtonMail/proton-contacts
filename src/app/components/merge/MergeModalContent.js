import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useModals, Alert } from 'react-components';

import { moveInGroup } from '../../helpers/array';

import ContactDetails from './ContactDetails';
import MergeContactPreview from './MergeContactPreview';
import MergeTable from './MergeTable';

const MergeModalContent = ({ contactID, userKeysList, model, updateModel, beMergedModel, beDeletedModel }) => {
    const { createModal } = useModals();

    const { orderedContacts, isChecked, beDeleted } = model;

    const handleToggleCheck = (ID) => {
        updateModel((model) => ({
            ...model,
            isChecked: { ...isChecked, [ID]: !isChecked[ID] }
        }));
    };
    const handleToggleDelete = (ID) => {
        updateModel((model) => ({
            ...model,
            beDeleted: { ...beDeleted, [ID]: !beDeleted[ID] }
        }));
    };
    const handleSortEnd = (groupIndex) => ({ oldIndex, newIndex }) => {
        updateModel((model) => ({
            ...model,
            orderedContacts: moveInGroup(orderedContacts, groupIndex, { oldIndex, newIndex })
        }));
    };

    const handleClickDetails = (contactID) => {
        createModal(<ContactDetails contactID={contactID} userKeysList={userKeysList} />);
    };

    const handlePreview = (beMergedID, beDeletedIDs) => {
        const beMergedModelSingle = { [beMergedID]: beMergedModel[beMergedID] };
        const beDeletedModelSingle = beDeletedIDs.reduce((acc, ID) => {
            acc[ID] = beDeletedModel[ID];
            return acc;
        }, {});

        createModal(
            <MergeContactPreview
                contactID={contactID}
                userKeysList={userKeysList}
                beMergedModel={beMergedModelSingle}
                beDeletedModel={beDeletedModelSingle}
                updateModel={updateModel}
            />
        );
    };

    return (
        <>
            <Alert>
                {c('Description')
                    .t`Use Drag and Drop to rank merging priority between contacts. Uncheck the contacts you do not want to merge.`}
            </Alert>
            <Alert type="warning">
                {c('Description')
                    .t`You can mark for deletion the contacts that you do not want neither to merge nor to keep.
                    Deletion will only take place after the merge button is clicked`}
            </Alert>
            <MergeTable
                onSortEnd={handleSortEnd}
                contacts={orderedContacts}
                isChecked={isChecked}
                beDeleted={beDeleted}
                onClickCheckbox={handleToggleCheck}
                onClickDetails={handleClickDetails}
                onToggleDelete={handleToggleDelete}
                onClickPreview={handlePreview}
            />
        </>
    );
};

MergeModalContent.propTypes = {
    contactID: PropTypes.string,
    userKeysList: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    updateModel: PropTypes.func.isRequired,
    beMergedModel: PropTypes.shape({ ID: PropTypes.arrayOf(PropTypes.string) }),
    beDeletedModel: PropTypes.shape({ ID: PropTypes.string })
};

export default MergeModalContent;
