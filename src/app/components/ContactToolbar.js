import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox, useContacts } from 'react-components';
import { c } from 'ttag';

import { extract } from '../helpers/merge';

const ContactToolbar = ({ onCheck, onDelete, checked }) => {
    const [contacts] = useContacts();
    const handleCheck = ({ target }) => onCheck(target.checked);
    const handleMerge = () => {};

    const emails = extract(contacts);
    const duplicates = Object.keys(emails).reduce((acc, key) => acc + emails[key].length, 0);
    const canMerge = duplicates > 0;

    return (
        <div className="toolbar flex noprint">
            <Checkbox className="flex pl1 pr1" checked={checked} onChange={handleCheck} />
            <button type="button" title={c('Tooltip').t`Delete`} className="pl1 pr1" onClick={onDelete}>
                <Icon name="delete" className="toolbar-icon" />
            </button>
            {canMerge ? (
                <button type="button" title={c('Tooltip').t`Merge`} className="pl1 pr1" onClick={handleMerge}>
                    <Icon name="merge" className="toolbar-icon" />
                </button>
            ) : null}
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
