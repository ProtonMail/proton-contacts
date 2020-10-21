import React, { useState } from 'react';
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
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import SidebarVersion from './SidebarVersion';
import SidebarGroups from './SidebarGroups';

const ContactsSidebar = ({
    logo,
    user,
    totalContacts,
    contactGroups,
    expanded,
    onToggleExpand,
    onClearSearch,
    contacts,
}) => {
    const history = useHistory();
    const { hasPaidMail } = user;
    const { createModal } = useModals();
    const [displayGroups, setDisplayGroups] = useState(true);

    const groupsWithCount = contactGroups.map((group) => ({
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
                    onClick={() => createModal(<ContactModal history={history} onAdd={onClearSearch} />)}
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
                        history={history}
                        hasPaidMail={hasPaidMail}
                        contactGroups={groupsWithCount}
                        displayGroups={displayGroups}
                        onToggle={() => setDisplayGroups((displayGroups) => !displayGroups)}
                    />
                </SidebarList>
            </SidebarNav>
        </Sidebar>
    );
};

ContactsSidebar.propTypes = {
    user: PropTypes.object,
    logo: PropTypes.node,
    totalContacts: PropTypes.number,
    contactGroups: PropTypes.array,
    expanded: PropTypes.bool,
    onToggleExpand: PropTypes.func,
    onClearSearch: PropTypes.func,
    contacts: PropTypes.arrayOf(PropTypes.object),
};

export default ContactsSidebar;
