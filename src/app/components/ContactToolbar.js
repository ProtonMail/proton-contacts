import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Icon,
    Checkbox,
    Toolbar,
    Tooltip,
    ToolbarLink,
    ToolbarButton,
    ToolbarSeparator,
    ContactGroupDropdown,
} from 'react-components';
import { c } from 'ttag';

const ContactToolbar = ({
    user,
    onCheck,
    onDelete,
    checked = false,
    activeIDs = [],
    contactEmailsMap = {},
    onMerge,
    simplified = false,
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
                <ToolbarLink to="/" icon="arrow-left" />
            </Toolbar>
        );
    }

    return (
        <Toolbar>
            <div className="flex-item-fluid flex flex-spacebetween">
                <div className="flex flex-nowrap">
                    <Tooltip
                        title={checked ? c('Action').t`Deselect all` : c('Action').t`Select all`}
                        className="flex flex-item-noshrink"
                    >
                        <Checkbox
                            className="flex pm-select-all ml0-5 pl1 pr1"
                            checked={checked}
                            id="idSelectAll"
                            onChange={handleCheck}
                        >
                            <span className="sr-only">
                                {checked ? c('Action').t`Deselect all` : c('Action').t`Select all`}
                            </span>
                        </Checkbox>
                    </Tooltip>
                    <ToolbarSeparator />
                    <ToolbarButton
                        icon="delete"
                        title={c('Action').t`Delete`}
                        className="toolbar-button"
                        onClick={onDelete}
                        disabled={!activeIDs.length}
                    />
                    {hasPaidMail ? (
                        <Tooltip title={c('Action').t`Add to group`} className="flex flex-item-noshrink">
                            <ContactGroupDropdown
                                className="toolbar-button toolbar-button--dropdown"
                                disabled={!contactEmailsSelected.length}
                                contactEmails={contactEmailsSelected}
                                forToolbar
                            >
                                <Icon name="contacts-groups" className="toolbar-icon mauto" />
                            </ContactGroupDropdown>
                        </Tooltip>
                    ) : null}
                    <ToolbarButton
                        icon="merge"
                        title={c('Action').t`Merge`}
                        className="toolbar-button"
                        onClick={onMerge}
                        disabled={activeIDs.length <= 1}
                    />
                </div>
            </div>
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
    simplified: PropTypes.bool,
};

export default ContactToolbar;
