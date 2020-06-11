import React from 'react';
import { useModals, PrimaryButton, Sidebar } from 'react-components';
import { c } from 'ttag';
import PropTypes from 'prop-types';

import ContactModal from '../components/ContactModal';
import ImportModal from '../components/import/ImportModal';
import ExportModal from '../components/ExportModal';
import UpgradeModal from '../components/UpgradeModal';
import SidebarVersion from './SidebarVersion';

const ContactsSidebar = ({
    url,
    user,
    userKeysList = [],
    loadingUserKeys,
    totalContacts,
    contactGroups,
    expanded,
    onToggleExpand,
    onClearSearch,
    history
}) => {
    const { hasPaidMail } = user;
    const { createModal } = useModals();

    const list = [
        {
            icon: 'contacts',
            isActive(match, location) {
                if (!match) {
                    return false;
                }
                const params = new URLSearchParams(location.search);
                const contactGroupID = params.get('contactGroupID');
                return !contactGroupID;
            },
            text: c('Link').t`Contacts`,
            link: '/contacts'
        },
        !loadingUserKeys && {
            type: 'button',
            className: 'alignleft',
            icon: 'import',
            text: c('Link').t`Import`,
            onClick() {
                createModal(<ImportModal userKeysList={userKeysList} />);
            }
        },
        totalContacts &&
            !loadingUserKeys && {
                type: 'button',
                className: 'alignleft',
                icon: 'export',
                text: c('Link').t`Export all`,
                onClick() {
                    createModal(<ExportModal userKeysList={userKeysList} />);
                }
            },
        {
            type: 'button',
            className: 'alignleft',
            icon: 'settings-singular',
            text: c('Link').t`Groups`,
            onClick() {
                if (!hasPaidMail) {
                    return createModal(<UpgradeModal />);
                }
                history.push('/contacts/settings/groups');
            }
        }
    ];

    if (hasPaidMail) {
        list.push(
            ...contactGroups.map(({ Name: text, Color: color, ID: contactGroupID }) => ({
                icon: 'contacts-groups',
                isActive(_match, location) {
                    const params = new URLSearchParams(location.search);
                    return params.get('contactGroupID') === contactGroupID;
                },
                color,
                text,
                link: `/contacts?contactGroupID=${contactGroupID}`
            }))
        );
    }

    return (
        <Sidebar
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            url={url}
            list={list.filter(Boolean)}
            version={<SidebarVersion />}
        >
            <div className="pl1 pr1 nomobile">
                <PrimaryButton
                    className="pm-button--large bold mt0-25 w100"
                    onClick={() => createModal(<ContactModal history={history} onAdd={onClearSearch} />)}
                >{c('Action').t`Add contact`}</PrimaryButton>
            </div>
        </Sidebar>
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
    userKeysList: PropTypes.array,
    loadingUserKeys: PropTypes.bool,
    history: PropTypes.object.isRequired
};

export default ContactsSidebar;
