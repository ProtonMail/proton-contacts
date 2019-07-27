import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { TableBody, TableRow, Button } from 'react-components';

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
    onClickPreview,
    ...rest
}) => {
    const isActive = isChecked.map((group, i) => group.map((checked, j) => checked && !isDeleted[i][j]));

    return (
        <TableBody colSpan={3} {...rest}>
            {contacts.map((group, i) => {
                const activeIDs = group.map(({ ID }, j) => isActive[i][j] && ID).filter(Boolean);

                return (
                    <React.Fragment key={i.toString()}>
                        {group.map(({ ID, Name, Emails }, j) => {
                            const deleted = isDeleted[i][j];

                            return (
                                <TableRow
                                    key={j.toString()}
                                    cells={[
                                        <NameTableCell
                                            key="name"
                                            name={Name}
                                            groupIndex={i}
                                            index={j}
                                            checked={isChecked[i][j]}
                                            deleted={deleted}
                                            greyedOut={deleted}
                                            onToggle={onClickCheckbox}
                                        />,
                                        <EmailsTableCell key="email" emails={Emails} greyedOut={deleted} />,
                                        <OptionsDropdown
                                            key="options"
                                            contactID={ID}
                                            groupIndex={i}
                                            index={j}
                                            canDelete={!deleted}
                                            onClickDetails={onClickDetails}
                                            onClickDelete={onClickDelete}
                                            onClickUndelete={onClickUndelete}
                                        />
                                    ]}
                                />
                            );
                        })}
                        <tr key="merge" className="aligncenter">
                            <td colSpan={3}>
                                <Button
                                    disabled={isActive[i].filter(Boolean).length < 2}
                                    type="button"
                                    onClick={() => onClickPreview(activeIDs)}
                                >
                                    {c('Action').t`Preview contact`}
                                </Button>
                            </td>
                        </tr>
                        {i !== group.length - 1 ? (
                            <tr key="dummy" className="aligncenter">
                                <td colSpan={3}></td>
                            </tr>
                        ) : null}
                    </React.Fragment>
                );
            })}
        </TableBody>
    );
};

MergeTableBody.propTypes = {
    contacts: PropTypes.array,
    isChecked: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    isDeleted: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    onClickCheckbox: PropTypes.func,
    onClickDetails: PropTypes.func,
    onClickDelete: PropTypes.func,
    onClickUndelete: PropTypes.func,
    onClickPreview: PropTypes.func
};

export default MergeTableBody;
