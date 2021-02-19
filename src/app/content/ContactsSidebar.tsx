import React, { ReactNode, useState } from 'react';
import {
    useModals,
    ContactModal,
    Sidebar,
    SidebarPrimaryButton,
    SidebarList,
    SidebarNav,
    SimpleSidebarListItemLink,
} from 'react-components';
import { c } from 'ttag';
import { UserModel } from 'proton-shared/lib/interfaces';
import { Contact, ContactEmail, ContactGroup } from 'proton-shared/lib/interfaces/contacts';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import SidebarVersion from './SidebarVersion';
import SidebarGroups from './SidebarGroups';
import { GroupsWithCount } from '../interfaces/GroupsWithCount';

interface Props {
    user: UserModel;
    logo: ReactNode;
    totalContacts: number;
    contactGroups: ContactGroup[];
    expanded: boolean;
    onToggleExpand: () => void;
    onClearSearch: () => void;
    contacts: Contact[];
    contactEmailsMap: SimpleMap<ContactEmail[]>;
}

const ContactsSidebar = ({
    logo,
    user,
    totalContacts,
    contactGroups,
    expanded,
    onToggleExpand,
    onClearSearch,
    contacts,
    contactEmailsMap,
}: Props) => {
    const { hasPaidMail } = user;
    const { createModal } = useModals();
    const [displayGroups, setDisplayGroups] = useState(true);

    const groupsWithCount = contactGroups.map<GroupsWithCount>((group) => ({
        ...group,
        count: contacts.filter((c) => c.LabelIDs.includes(group.ID)).length,
    }));

    return (
        <Sidebar
            logo={logo}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            primary={
                <SidebarPrimaryButton
                    className="no-mobile"
                    onClick={() => createModal(<ContactModal onAdd={onClearSearch} />)}
                >{c('Action').t`New contact`}</SidebarPrimaryButton>
            }
            version={<SidebarVersion />}
        >
            <SidebarNav>
                <SidebarList>
                    <SimpleSidebarListItemLink
                        to="/"
                        isActive={(match, location) => {
                            if (!match) {
                                return false;
                            }
                            const params = new URLSearchParams(location.search);
                            const contactGroupID = params.get('contactGroupID');
                            return !contactGroupID;
                        }}
                        icon="contacts"
                    >
                        {c('Link').t`All Contacts (${totalContacts})`}
                    </SimpleSidebarListItemLink>
                    <SidebarGroups
                        hasPaidMail={hasPaidMail}
                        contactGroups={groupsWithCount}
                        displayGroups={displayGroups}
                        onToggle={() => setDisplayGroups((displayGroups) => !displayGroups)}
                        contactEmailsMap={contactEmailsMap}
                    />
                </SidebarList>
            </SidebarNav>
        </Sidebar>
    );
};

export default ContactsSidebar;
