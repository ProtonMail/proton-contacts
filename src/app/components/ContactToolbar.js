import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox } from 'react-components';
import { c } from 'ttag';
import ContactGroupDropdown from './ContactGroupDropdown';

const ContactToolbar = ({ user, onCheck, onDelete, checked = false, contactID, checkedContacts, contactEmailsMap }) => {
    // Include current contact as selected if none is checked
    const activeContacts =
        !!Object.values(checkedContacts).filter(Boolean).length || !contactID ? checkedContacts : { [contactID]: true };

    const handleCheck = ({ target }) => onCheck(target.checked);

    const contactEmailsSelected = useMemo(() => {
        return Object.entries(activeContacts)
            .filter(([, isChecked]) => isChecked)
            .reduce((acc, [ID]) => {
                if (!contactEmailsMap[ID]) {
                    return acc;
                }
                return acc.concat(contactEmailsMap[ID]);
            }, []);
    }, [checkedContacts, contactEmailsMap, contactID]);

    return (
        <div className="toolbar flex noprint">
            <Checkbox className="flex pl1 pr1" checked={checked} onChange={handleCheck} />
            <button
                type="button"
                title={c('Tooltip').t`Delete`}
                className="pl1 pr1"
                onClick={onDelete}
                disabled={!contactEmailsSelected.length}
            >
                <Icon name="delete" className="toolbar-icon" />
            </button>
            {user.hasPaidMail ? (
                <ContactGroupDropdown
                    className="pl1 pr1 color-white"
                    disabled={!contactEmailsSelected.length}
                    contactEmails={contactEmailsSelected}
                >
                    <Icon name="contacts-groups" className="toolbar-icon" />
                </ContactGroupDropdown>
            ) : null}
        </div>
    );
};

ContactToolbar.propTypes = {
    checked: PropTypes.bool,
    user: PropTypes.object,
    onCheck: PropTypes.func,
    onDelete: PropTypes.func,
    contactID: PropTypes.string,
    checkedContacts: PropTypes.object,
    contactEmailsMap: PropTypes.object
};

export default ContactToolbar;
