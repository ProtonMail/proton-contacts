import React from 'react';
import PropTypes from 'prop-types';
import { OrderableTableBody, OrderableTableRow, TableRow } from 'react-components';

import NameTableCell from './NameTableCell';
import EmailsTableCell from './EmailsTableCell';
import OptionsDropdown from './OptionsDropdown';

const MergeTableBody = ({
    contacts,
    isChecked,
    isDeleted,
    onClickCheckbox,
    onClickDetails,
    onClickDelete,
    onClickUndelete,
    ...rest
}) => {
    return (
        <OrderableTableBody colSpan={4} {...rest}>
            {contacts.map(({ ID, Name, Emails }, j) => {
                const deleted = isDeleted[j];
                const cells = [
                    <NameTableCell
                        key="name"
                        name={Name}
                        index={j}
                        checked={isChecked[j]}
                        deleted={deleted}
                        greyedOut={deleted}
                        onToggle={onClickCheckbox}
                    />,
                    <EmailsTableCell key="email" emails={Emails} greyedOut={deleted} />,
                    <OptionsDropdown
                        key="options"
                        contactID={ID}
                        index={j}
                        canDelete={!deleted}
                        onClickDetails={onClickDetails}
                        onClickDelete={onClickDelete}
                        onClickUndelete={onClickUndelete}
                    />
                ];

                return deleted ? (
                    <TableRow key={`${ID}`} index={j} cells={[null, ...cells]} />
                ) : (
                    <OrderableTableRow key={`${ID}`} index={j} cells={cells} />
                );
            })}
        </OrderableTableBody>
    );
};

MergeTableBody.propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.object),
    isChecked: PropTypes.arrayOf(PropTypes.bool),
    isDeleted: PropTypes.arrayOf(PropTypes.bool),
    onClickCheckbox: PropTypes.func,
    onClickDetails: PropTypes.func,
    onClickDelete: PropTypes.func,
    onClickUndelete: PropTypes.func,
    onClickPreview: PropTypes.func
};

export default MergeTableBody;
