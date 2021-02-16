import React, { ChangeEvent, useMemo } from 'react';
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
import { UserModel } from 'proton-shared/lib/interfaces';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import { ContactEmail } from 'proton-shared/lib/interfaces/contacts';

interface Props {
    checked: boolean;
    user: UserModel;
    onCheckAll: (checked: boolean) => void;
    onDelete: () => void;
    activeIDs: string[];
    contactEmailsMap: SimpleMap<ContactEmail[]>;
    onMerge: () => void;
    simplified: boolean;
}

const ContactToolbar = ({
    user,
    onCheckAll,
    onDelete,
    checked = false,
    activeIDs = [],
    contactEmailsMap = {},
    onMerge,
    simplified = false,
}: Props) => {
    const { hasPaidMail } = user;
    const handleCheck = ({ target }: ChangeEvent<HTMLInputElement>) => onCheckAll(target.checked);

    const contactEmailsSelected = useMemo(() => {
        return activeIDs.reduce<ContactEmail[]>((acc, ID) => {
            if (!contactEmailsMap[ID]) {
                return acc;
            }
            return acc.concat(contactEmailsMap[ID] as ContactEmail[]);
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
            <div className="flex-item-fluid flex flex-justify-space-between">
                <div className="flex flex-nowrap">
                    <Tooltip
                        title={checked ? c('Action').t`Deselect all` : c('Action').t`Select all`}
                        className="flex flex-item-noshrink"
                    >
                        <Checkbox
                            className="flex select-all ml0-5 pl1 pr1"
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

export default ContactToolbar;
