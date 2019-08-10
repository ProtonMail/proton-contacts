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
                <TableCell type="header" className="w30">{c('TableHeader').t`NAME`}</TableCell>
                <TableCell type="header">{c('TableHeader').t`ADDRESS`}</TableCell>
                <TableCell type="header" className="w20">
                    {c('TableHeader').t`ACTIONS`}
                </TableCell>
            </tr>
        </thead>
    );
};

const MergeTable = ({
    contacts = [],
    isChecked,
    isDeleted,
    onClickCheckbox,
    onClickDetails,
    onClickDelete,
    onClickUndelete,
    onClickPreview,
    onSortEnd
}) => {
    return (
        <>
            {contacts.map((group, i) => {
                const isActive = isChecked.map((group, i) => group.map((checked, j) => checked && !isDeleted[i][j]));
                const activeIDs = group.map(({ ID }, j) => isActive[i][j] && ID).filter(Boolean);

                return (
                    <Block key={`${group && group[0].Name}`} className="mb2 flex flex-column flex-items-center">
                        <OrderableTable onSortEnd={onSortEnd(i)} className="mb1">
                            <MergeTableHeader />
                            <MergeTableBody
                                contacts={group}
                                isChecked={isChecked[i]}
                                isDeleted={isDeleted[i]}
                                onClickCheckbox={onClickCheckbox(i)}
                                onClickDetails={onClickDetails}
                                onClickDelete={onClickDelete(i)}
                                onClickUndelete={onClickUndelete(i)}
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
    isChecked: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    isDeleted: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    onClickCheckbox: PropTypes.func,
    onClickDetails: PropTypes.func,
    onClickDelete: PropTypes.func,
    onClickUndelete: PropTypes.func,
    onClickPreview: PropTypes.func,
    onSortEnd: PropTypes.func
};

export default MergeTable;
