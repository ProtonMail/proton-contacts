import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox } from 'react-components';
import { c } from 'ttag';

const ContactToolbar = ({ onCheck, onDelete, checked }) => {
    const handleCheck = ({ target }) => onCheck(target.checked);

    return (
        <div className="toolbar flex noprint">
            <Checkbox className="flex pl1 pr1" checked={checked} onChange={handleCheck} />
            <button type="button" title={c('Tooltip').t`Delete`} className="pl1 pr1" onClick={onDelete}>
                <Icon name="delete" className="toolbar-icon" />
            </button>
        </div>
    );
};

ContactToolbar.propTypes = {
    checked: PropTypes.bool,
    onCheck: PropTypes.func,
    onDelete: PropTypes.func
};

ContactToolbar.defaultProps = {
    checked: false
};

export default ContactToolbar;
