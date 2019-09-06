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
    beDeleted = {},
    onClickCheckbox,
    onClickDetails,
    onToggleDelete,
    onClickPreview,
    onSortEnd
}) => {
    return (
        <>
            {contacts.map((group, i) => {
                const activeIDs = group.map(({ ID }) => isChecked[ID] && !beDeleted[ID] && ID).filter(Boolean);
                const highlightedID = activeIDs.length > 1 ? activeIDs[0] : undefined;

                return (
                    <Block key={`${group && group[0].Name}`} className="mb2 flex flex-column flex-items-center">
                        <OrderableTable onSortEnd={onSortEnd(i)} className="mb1">
                            <MergeTableHeader />
                            <MergeTableBody
                                contacts={group}
                                highlightedID={highlightedID}
                                isChecked={isChecked}
                                beDeleted={beDeleted}
                                onClickCheckbox={onClickCheckbox}
                                onClickDetails={onClickDetails}
                                onToggleDelete={onToggleDelete}
                            />
                        </OrderableTable>
                        <Button
                            className="aligcenter"
                            disabled={activeIDs.length < 2}
                            type="button"
                            onClick={() => onClickPreview(activeIDs, i)}
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
    beDeleted: PropTypes.object,
    onClickCheckbox: PropTypes.func,
    onClickDetails: PropTypes.func,
    onToggleDelete: PropTypes.func,
    onClickPreview: PropTypes.func,
    onSortEnd: PropTypes.func
};

export default MergeTable;
