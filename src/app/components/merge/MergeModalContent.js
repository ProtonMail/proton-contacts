import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert } from 'react-components';

import MergeTable from './MergeTable';

const MergeModalContent = ({
    onSortEnd,
    orderedContacts,
    isChecked,
    isDeleted,
    onClickCheckbox,
    onClickDetails,
    onClickDelete,
    onClickUndelete,
    onClickPreview
}) => {
    return (
        <>
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
                onSortEnd={onSortEnd}
                contacts={orderedContacts}
                isChecked={isChecked}
                isDeleted={isDeleted}
                onClickCheckbox={onClickCheckbox}
                onClickDetails={onClickDetails}
                onClickDelete={onClickDelete}
                onClickUndelete={onClickUndelete}
                onClickPreview={onClickPreview}
            />
        </>
    );
};

MergeModalContent.propTypes = {
    orderedContacts: PropTypes.array,
    isChecked: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    isDeleted: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    onClickCheckbox: PropTypes.func,
    onClickDetails: PropTypes.func,
    onClickDelete: PropTypes.func,
    onClickUndelete: PropTypes.func,
    onClickPreview: PropTypes.func,
    onSortEnd: PropTypes.func
};

export default MergeModalContent;
