import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Dropdown, DropdownMenu, DropdownButton } from 'react-components';

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
    contactID: PropTypes.string.isRequired,
    groupIndex: PropTypes.number.isRequired,
    index: PropTypes.number,
    canDelete: PropTypes.bool,
    onClickDelete: PropTypes.func,
    onClickUndelete: PropTypes.func
};

export default OptionsDropdown;
