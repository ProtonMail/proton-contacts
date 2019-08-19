import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox } from 'react-components';
import { c } from 'ttag';
import ContactGroupDropdown from './ContactGroupDropdown';

const ContactToolbar = ({ user, onCheck, onDelete, checked = false, activeIDs, contactEmailsMap }) => {
    const handleCheck = ({ target }) => onCheck(target.checked);

    const contactEmailsSelected = useMemo(() => {
        return activeIDs.reduce((acc, ID) => {
            if (!contactEmailsMap[ID]) {
                return acc;
            }
            return acc.concat(contactEmailsMap[ID]);
        }, []);
    }, [activeIDs, contactEmailsMap]);

    return (
        <div className="toolbar flex noprint">
            <Checkbox className="flex pl1 pr1" checked={checked} onChange={handleCheck} />
            <button
                type="button"
                title={c('Tooltip').t`Delete`}
                className="pl1 pr1"
                onClick={onDelete}
                disabled={!activeIDs.length}
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
    activeIDs: PropTypes.array,
    contactEmailsMap: PropTypes.object
};

export default ContactToolbar;
