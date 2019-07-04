import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox, useContactEmails } from 'react-components';
import { c } from 'ttag';
import ContactGroupDropdown from './ContactGroupDropdown';

const ContactToolbar = ({ onCheck, onDelete, checked, checkedContacts }) => {
    const [contactEmails] = useContactEmails();
    const handleCheck = ({ target }) => onCheck(target.checked);
    const contactEmailsSelected = Object.entries(checkedContacts).reduce((acc, [contactID, isChecked]) => {
        if (isChecked) {
            acc.push(...contactEmails.filter(({ ContactID }) => ContactID === contactID));
        }
        return acc;
    }, []);

    return (
        <div className="toolbar flex noprint">
            <Checkbox className="flex pl1 pr1" checked={checked} onChange={handleCheck} />
            <button
                disabled={!contactEmailsSelected.length}
                type="button"
                title={c('Tooltip').t`Delete`}
                className="pl1 pr1"
                onClick={onDelete}
            >
                <Icon name="delete" className="toolbar-icon" />
            </button>
            <ContactGroupDropdown disabled={!contactEmailsSelected.length} contactEmails={contactEmailsSelected}>
                <Icon name="contacts-groups" className="toolbar-icon" />
            </ContactGroupDropdown>
        </div>
    );
};

ContactToolbar.propTypes = {
    checked: PropTypes.bool,
    onCheck: PropTypes.func,
    onDelete: PropTypes.func,
    checkedContacts: PropTypes.object
};

ContactToolbar.defaultProps = {
    checked: false
};

export default ContactToolbar;
