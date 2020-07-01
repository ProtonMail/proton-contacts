import React, { useState } from 'react';
import {
    useModals,
    PrimaryButton,
    MainLogo,
    Hamburger,
    MobileAppsLinks,
    ContactModal,
    NavItem
} from 'react-components';
import { c } from 'ttag';
import PropTypes from 'prop-types';

import SidebarVersion from './SidebarVersion';
import SidebarGroups from './SidebarGroups';

const ContactsSidebar = ({
    url,
    user,
    totalContacts,
    contactGroups,
    expanded,
    onToggleExpand,
    onClearSearch,
    history,
    contacts
}) => {
    const { hasPaidMail } = user;
    const { createModal } = useModals();
    const [displayGroups, setDisplayGroups] = useState(true);

    const groupsWithCount = contactGroups.map((group) => ({
        ...group,
        count: contacts.filter((c) => c.LabelIDs.includes(group.ID)).length
    }));

    return (
        <div className="sidebar flex flex-column noprint" data-expanded={expanded}>
            <div className="nodesktop notablet flex-item-noshrink">
                <div className="flex flex-spacebetween flex-items-center">
                    <MainLogo url={url} />
                    <Hamburger expanded={expanded} onToggle={onToggleExpand} />
                </div>
            </div>
            <div className="pl1 pr1 nomobile">
                <PrimaryButton
                    className="pm-button--large bold mt0-25 w100"
                    onClick={() => createModal(<ContactModal history={history} onAdd={onClearSearch} />)}
                >{c('Action').t`Add contact`}</PrimaryButton>
            </div>
            <nav className="navigation mw100 flex-item-fluid customScrollBar-container scroll-if-needed">
                <ul className="unstyled">
                    <NavItem
                        icon="contacts"
                        isActive={(match, location) => {
                            if (!match) {
                                return false;
                            }
                            const params = new URLSearchParams(location.search);
                            const contactGroupID = params.get('contactGroupID');
                            return !contactGroupID;
                        }}
                        text={c('Link').t`All Contacts (${totalContacts})`}
                        link="/contacts"
                        title={c('Link').t`All Contacts (${totalContacts})`}
                    />
                    <SidebarGroups
                        history={history}
                        hasPaidMail={hasPaidMail}
                        contactGroups={groupsWithCount}
                        displayGroups={displayGroups}
                        onToggle={() => setDisplayGroups((displayGroups) => !displayGroups)}
                    />
                </ul>
            </nav>
            <SidebarVersion />
            <MobileAppsLinks />
        </div>
    );
};

ContactsSidebar.propTypes = {
    url: PropTypes.string,
    user: PropTypes.object,
    totalContacts: PropTypes.number,
    contactGroups: PropTypes.array,
    expanded: PropTypes.bool,
    onToggleExpand: PropTypes.func,
    onClearSearch: PropTypes.func,
    history: PropTypes.object.isRequired,
    contacts: PropTypes.arrayOf(PropTypes.object)
};

export default ContactsSidebar;
