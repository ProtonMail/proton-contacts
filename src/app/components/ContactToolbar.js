import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox, ToolbarSeparator } from 'react-components';
import { Link } from 'react-router-dom';
import { c } from 'ttag';
import ContactGroupDropdown from './ContactGroupDropdown';

const ContactToolbar = ({
    user,
    onCheck,
    onDelete,
    checked = false,
    filteredCheckedIDs = [],
    contactEmailsMap = {},
    simplified = false
}) => {
    const handleCheck = ({ target }) => onCheck(target.checked);

    const contactEmailsSelected = useMemo(() => {
        return filteredCheckedIDs.reduce((acc, ID) => {
            if (!contactEmailsMap[ID]) {
                return acc;
            }
            return acc.concat(contactEmailsMap[ID]);
        }, []);
    }, [filteredCheckedIDs, contactEmailsMap]);

    if (simplified) {
        return (
            <div className="toolbar flex noprint">
                <Link to="/contacts" className="toolbar-button">
                    <Icon name="arrow-left" className="toolbar-icon mauto" />
                </Link>
            </div>
        );
    }

    return (
        <div className="toolbar flex noprint">
            <Checkbox className="flex pm-select-all ml0-75 pl1 pr1" checked={checked} onChange={handleCheck} />
            <ToolbarSeparator />
            <button
                type="button"
                title={c('Tooltip').t`Delete`}
                className="toolbar-button"
                onClick={onDelete}
                disabled={!filteredCheckedIDs.length}
            >
                <Icon name="delete" className="toolbar-icon mauto" />
            </button>
            {user.hasPaidMail ? (
                <ContactGroupDropdown
                    className="toolbar-button toolbar-button--dropdown"
                    disabled={!contactEmailsSelected.length}
                    contactEmails={contactEmailsSelected}
                    forToolbar={true}
                >
                    <Icon name="contacts-groups" className="toolbar-icon mauto" />
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
    filteredCheckedIDs: PropTypes.array,
    contactEmailsMap: PropTypes.object,
    simplified: PropTypes.bool
};

export default ContactToolbar;
