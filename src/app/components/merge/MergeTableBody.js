import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { OrderableTableBody, OrderableTableRow, TableRow, DropdownActions } from 'react-components';

import NameTableCell from './NameTableCell';
import EmailsTableCell from './EmailsTableCell';

const MergeTableBody = ({
    contacts,
    highlightedID,
    isChecked,
    beDeleted,
    onClickCheckbox,
    onClickDetails,
    onToggleDelete,
    ...rest
}) => {
    return (
        <OrderableTableBody colSpan={4} {...rest}>
            {contacts.map(({ ID, Name, emails }, j) => {
                const deleted = beDeleted[ID];
                const options = [
                    !deleted && {
                        text: c('Action').t`Contact details`,
                        onClick() {
                            onClickDetails(ID);
                        },
                    },
                    {
                        text: deleted ? c('Action').t`Unmark for deletion` : c('Action').t`Mark for deletion`,
                        onClick() {
                            onToggleDelete(ID);
                        },
                    },
                ].filter(Boolean);
                const cells = [
                    <NameTableCell
                        key="name"
                        name={Name}
                        contactID={ID}
                        highlightedID={highlightedID}
                        checked={isChecked[ID]}
                        deleted={deleted}
                        greyedOut={deleted}
                        onToggle={onClickCheckbox}
                    />,
                    <EmailsTableCell
                        key="email"
                        contactID={ID}
                        highlightedID={highlightedID}
                        emails={emails}
                        greyedOut={deleted}
                    />,
                    <DropdownActions key="options" className="pm-button--small" list={options} />,
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
    highlightedID: PropTypes.string,
    isChecked: PropTypes.object,
    beDeleted: PropTypes.object,
    onClickCheckbox: PropTypes.func,
    onClickDetails: PropTypes.func,
    onToggleDelete: PropTypes.func,
    onClickPreview: PropTypes.func,
};

export default MergeTableBody;
