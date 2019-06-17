import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Checkbox, useContacts } from 'react-components';
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
        <div className="toolbar noprint">
            <Checkbox checked={checked} onChange={handleCheck} />
            <Button title={c('Tooltip').t`Delete`} className="pm-button--for-icon mr1" onClick={onDelete}>
                <Icon name="delete" />
            </Button>
            {canMerge ? (
                <Button title={c('Tooltip').t`Merge`} className="pm-button--for-icon" onClick={handleMerge}>
                    <Icon name="merge" />
                </Button>
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
