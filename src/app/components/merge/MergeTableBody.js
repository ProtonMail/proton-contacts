import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { TableBody, TableRow, Button, Dropdown, DropdownMenu, DropdownButton, Checkbox } from 'react-components';

const opaqueClassName = (greyedOut) => (greyedOut ? 'opacity-50' : '');

const ShowName = ({ name, checked, deleted, greyedOut, groupIndex, index, onToggle }) => {
    const handleToggle = () => onToggle(groupIndex, index);

    return (
        <>
            <Checkbox checked={checked} onChange={handleToggle} className={`mr0-5 ${deleted ? 'nonvisible' : ''}`} />
            <span className={`mw100 inbl ellipsis ${opaqueClassName(greyedOut)}`}>{name}</span>
        </>
    );
};

ShowName.propTypes = {
    groupIndex: PropTypes.number,
    index: PropTypes.number,
    checked: PropTypes.bool,
    deleted: PropTypes.bool,
    greyedOut: PropTypes.bool,
    name: PropTypes.string,
    onToggle: PropTypes.func
};

const ShowEmails = ({ emails, greyedOut }) => {
    return <span className={`mw100 inbl ellipsis ${opaqueClassName(greyedOut)}`}>{emails.join(', ')}</span>;
};

ShowEmails.propTypes = {
    emails: PropTypes.arrayOf(PropTypes.string),
    greyedOut: PropTypes.bool
};

const OptionsDropdown = ({
    contactID,
    groupIndex,
    index,
    canDelete,
    onClickDetails,
    onClickDelete,
    onClickUndelete
}) => {
    const color = canDelete ? 'color-global-warning' : 'color-pv-green';
    const text = canDelete ? c('Action').t`Mark for deletion` : c('Action').t`Unmark for deletion`;
    const handleClick = canDelete ? () => onClickDelete(groupIndex, index) : () => onClickUndelete(groupIndex, index);

    return (
        <Dropdown
            caret
            className="pm-button pm-group-button pm-button--for-icon pm-button--small"
            content={c('Title').t`Options`}
        >
            <DropdownMenu>
                {canDelete ? (
                    <DropdownButton className="color-pm-blue" type="button" onClick={() => onClickDetails(contactID)}>
                        {c('Action').t`Contact details`}
                    </DropdownButton>
                ) : null}
                <DropdownButton className={color} type="button" onClick={handleClick}>
                    {text}
                </DropdownButton>
            </DropdownMenu>
        </Dropdown>
    );
};

OptionsDropdown.propTypes = {
    contactID: PropTypes.string,
    groupIndex: PropTypes.number,
    index: PropTypes.number,
    canDelete: PropTypes.bool,
    onClickDelete: PropTypes.func,
    onClickUndelete: PropTypes.func
};

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
        <TableBody colSpan={3} {...rest}>
            {contacts.map((mergeable, i) => {
                return (
                    <React.Fragment key={i.toString()}>
                        {mergeable.map(({ ID, Name, Emails }, j) => {
                            const deleted = isDeleted[i][j];

                            return (
                                <TableRow
                                    key={j.toString()}
                                    cells={[
                                        <ShowName
                                            name={Name}
                                            groupIndex={i}
                                            index={j}
                                            checked={isChecked[i][j]}
                                            deleted={deleted}
                                            greyedOut={deleted}
                                            onToggle={onClickCheckbox}
                                        />,
                                        <ShowEmails emails={Emails} greyedOut={deleted} />,
                                        <OptionsDropdown
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
                                <Button>{c('Action').t`Preview contact`}</Button>
                            </td>
                        </tr>
                        {i !== mergeable.length - 1 ? (
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
    onClickUndelete: PropTypes.func
};

export default MergeTableBody;
