import React from 'react';
import PropTypes from 'prop-types';
import { OrderableTableBody, OrderableTableRow, TableRow } from 'react-components';

import NameTableCell from './NameTableCell';
import EmailsTableCell from './EmailsTableCell';
import OptionsDropdown from './OptionsDropdown';

const MergeTableBody = ({
    contacts,
    isChecked,
    beDeleted,
    onClickCheckbox,
    onClickDetails,
    onClickDelete,
    onClickUndelete,
    ...rest
}) => {
    return (
        <OrderableTableBody colSpan={4} {...rest}>
            {contacts.map(({ ID, Name, emails }, j) => {
                const deleted = beDeleted[ID];
                const cells = [
                    <NameTableCell
                        key="name"
                        name={Name}
                        contactID={ID}
                        index={j}
                        checked={isChecked[ID]}
                        deleted={deleted}
                        greyedOut={deleted}
                        onToggle={onClickCheckbox}
                    />,
                    <EmailsTableCell key="email" emails={emails} greyedOut={deleted} />,
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
    isChecked: PropTypes.object,
    beDeleted: PropTypes.object,
    onClickCheckbox: PropTypes.func,
    onClickDetails: PropTypes.func,
    onClickDelete: PropTypes.func,
    onClickUndelete: PropTypes.func,
    onClickPreview: PropTypes.func
};

export default MergeTableBody;
