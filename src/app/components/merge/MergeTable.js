import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Block, OrderableTable, TableCell, Button } from 'react-components';

import MergeTableBody from './MergeTableBody';

const MergeTableHeader = () => {
    return (
        <thead className="orderableTableHeader">
            <tr>
                <TableCell type="header" />
                <TableCell type="header">{c('TableHeader').t`NAME`}</TableCell>
                <TableCell type="header">{c('TableHeader').t`ADDRESS`}</TableCell>
                <TableCell type="header">{c('TableHeader').t`ACTIONS`}</TableCell>
            </tr>
        </thead>
    );
};

const MergeTable = ({
    contacts = [],
    isChecked = {},
<<<<<<< HEAD
    beDeleted = {},
=======
    isDeleted = {},
>>>>>>> refactor merge modal
    onClickCheckbox,
    onClickDetails,
    onToggleDelete,
    onClickPreview,
    onSortEnd
}) => {
    return (
        <>
            {contacts.map((group, i) => {
<<<<<<< HEAD
                const activeIDs = group.map(({ ID }) => isChecked[ID] && !beDeleted[ID] && ID).filter(Boolean);
                const beDeletedIDs = group.map(({ ID }) => beDeleted[ID] && ID).filter(Boolean);
                const beMergedIDs = activeIDs.length > 1 ? activeIDs : [];
=======
                const activeIDs = group.map(({ ID }) => isChecked[ID] && !isDeleted[ID] && ID).filter(Boolean);
>>>>>>> refactor merge modal

                return (
                    <Block key={`${group && group[0].Name}`} className="mb2 flex flex-column flex-items-center">
                        <OrderableTable onSortEnd={onSortEnd(i)} className="mb1">
                            <MergeTableHeader />
                            <MergeTableBody
                                contacts={group}
<<<<<<< HEAD
                                highlightedID={beMergedIDs[0]}
                                isChecked={isChecked}
                                beDeleted={beDeleted}
                                onClickCheckbox={onClickCheckbox}
                                onClickDetails={onClickDetails}
                                onToggleDelete={onToggleDelete}
=======
                                isChecked={isChecked}
                                isDeleted={isDeleted}
                                onClickCheckbox={onClickCheckbox}
                                onClickDetails={onClickDetails}
                                onClickDelete={onClickDelete}
                                onClickUndelete={onClickUndelete}
>>>>>>> refactor merge modal
                            />
                        </OrderableTable>
                        <Button
                            className="aligcenter"
                            disabled={!beMergedIDs.length}
                            type="button"
                            onClick={() => onClickPreview(beMergedIDs[0], beDeletedIDs)}
                        >
                            {c('Action').t`Preview contact`}
                        </Button>
                    </Block>
                );
            })}
        </>
    );
};

MergeTable.propTypes = {
    contacts: PropTypes.array,
    isChecked: PropTypes.object,
<<<<<<< HEAD
    beDeleted: PropTypes.object,
=======
    isDeleted: PropTypes.object,
>>>>>>> refactor merge modal
    onClickCheckbox: PropTypes.func,
    onClickDetails: PropTypes.func,
    onToggleDelete: PropTypes.func,
    onClickPreview: PropTypes.func,
    onSortEnd: PropTypes.func
};

export default MergeTable;
