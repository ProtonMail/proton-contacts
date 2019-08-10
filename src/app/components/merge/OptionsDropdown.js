import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { SimpleDropdown, DropdownMenu, DropdownButton } from 'react-components';

const OptionsDropdown = ({ contactID, index, canDelete, onClickDetails, onClickDelete, onClickUndelete }) => {
    const color = canDelete ? 'color-global-warning' : 'color-pv-green';
    const text = canDelete ? c('Action').t`Mark for deletion` : c('Action').t`Unmark for deletion`;
    const handleClick = canDelete ? () => onClickDelete(index) : () => onClickUndelete(index);

    return (
        <SimpleDropdown
            hasCaret
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
        </SimpleDropdown>
    );
};

OptionsDropdown.propTypes = {
    contactID: PropTypes.string.isRequired,
    index: PropTypes.number,
    canDelete: PropTypes.bool,
    onClickDelete: PropTypes.func,
    onClickUndelete: PropTypes.func
};

export default OptionsDropdown;
