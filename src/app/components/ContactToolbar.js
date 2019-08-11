import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox } from 'react-components';
import { c } from 'ttag';
import ContactGroupDropdown from './ContactGroupDropdown';

const ContactToolbar = ({ user, onCheck, onDelete, checked, checkedContacts, contactEmailsMap }) => {
    const handleCheck = ({ target }) => onCheck(target.checked);

    const contactEmailsSelected = useMemo(() => {
        return Object.entries(checkedContacts)
            .filter(([, isChecked]) => isChecked)
            .reduce((acc, [contactID]) => {
                if (!contactEmailsMap[contactID]) {
                    return acc;
                }
                return acc.concat(contactEmailsMap[contactID]);
            }, []);
    }, [checkedContacts, contactEmailsMap]);

    return (
        <div className="toolbar flex noprint">
            <Checkbox className="flex pl1 pr1" checked={checked} onChange={handleCheck} />
            <button type="button" title={c('Tooltip').t`Delete`} className="pl1 pr1" onClick={onDelete}>
                <Icon name="delete" className="toolbar-icon" />
            </button>
            {user.hasPaidMail ? <ContactGroupDropdown disabled={!contactEmailsSelected.length} contactEmails={contactEmailsSelected}>
                <Icon name="contacts-groups" className="toolbar-icon" />
            </ContactGroupDropdown> : null}
        </div>
    );
};

ContactToolbar.propTypes = {
    checked: PropTypes.bool,
    user: PropTypes.object,
    onCheck: PropTypes.func,
    onDelete: PropTypes.func,
    checkedContacts: PropTypes.object,
    contactEmailsMap: PropTypes.object
};

ContactToolbar.defaultProps = {
    checked: false
};

export default ContactToolbar;
