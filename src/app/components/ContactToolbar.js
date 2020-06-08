import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox, Toolbar, ToolbarLink, ToolbarButton, ToolbarSeparator } from 'react-components';
import { c } from 'ttag';

import ContactGroupDropdown from './ContactGroupDropdown';

const ContactToolbar = ({
    user,
    onCheck,
    onDelete,
    checked = false,
    activeIDs = [],
    contactEmailsMap = {},
    onMerge,
    simplified = false
}) => {
    const { hasPaidMail } = user;
    const handleCheck = ({ target }) => onCheck(target.checked);

    const contactEmailsSelected = useMemo(() => {
        return activeIDs.reduce((acc, ID) => {
            if (!contactEmailsMap[ID]) {
                return acc;
            }
            return acc.concat(contactEmailsMap[ID]);
        }, []);
    }, [activeIDs, contactEmailsMap]);

    if (simplified) {
        return (
            <Toolbar>
                <ToolbarLink to="/contacts" icon="arrow-left" />
            </Toolbar>
        );
    }

    return (
        <Toolbar>
            <Checkbox className="flex pm-select-all ml0-5 pl1 pr1" checked={checked} onChange={handleCheck} />
            <ToolbarSeparator />
            <ToolbarButton
                icon="delete"
                title={c('Action').t`Delete`}
                className="toolbar-button"
                onClick={onDelete}
                disabled={!activeIDs.length}
            />
            {hasPaidMail ? (
                <ContactGroupDropdown
                    className="toolbar-button toolbar-button--dropdown"
                    disabled={!contactEmailsSelected.length}
                    contactEmails={contactEmailsSelected}
                    forToolbar={true}
                >
                    <Icon name="contacts-groups" className="toolbar-icon mauto" />
                </ContactGroupDropdown>
            ) : null}
            <ToolbarButton
                icon="merge"
                title={c('Action').t`Merge`}
                className="toolbar-button"
                onClick={onMerge}
                disabled={activeIDs.length <= 1}
            />
        </Toolbar>
    );
};

ContactToolbar.propTypes = {
    checked: PropTypes.bool,
    user: PropTypes.object,
    onCheck: PropTypes.func,
    onDelete: PropTypes.func,
    activeIDs: PropTypes.array,
    contactEmailsMap: PropTypes.object,
    onMerge: PropTypes.func,
    simplified: PropTypes.bool
};

export default ContactToolbar;
