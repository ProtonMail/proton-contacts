import React from 'react';
import { useModals, PrimaryButton, Sidebar } from 'react-components';
import { c } from 'ttag';
import PropTypes from 'prop-types';

import ContactModal from '../components/ContactModal';
import ImportModal from '../components/import/ImportModal';
import ExportModal from '../components/ExportModal';
import UpgradeModal from '../components/UpgradeModal';

const PrivateSidebar = ({
    url,
    onToggleExpand,
    expanded,
    user,
    userKeysList = [],
    loadingUserKeys,
    totalContacts,
    contactGroups = [],
    history,
    onClearSearch
}) => {
    const { hasPaidMail } = user;
    const { createModal } = useModals();

    const list = [
        {
            type: 'button',
            className: 'alignleft',
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
            onClick() {
                onClearSearch();
                history.push(`/contacts`);
            }
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
                type: 'button',
                className: 'alignleft',
                icon: 'contacts-groups',
                isActive(_match, location) {
                    const params = new URLSearchParams(location.search);
                    return params.get('contactGroupID') === contactGroupID;
                },
                color,
                text,
                onClick() {
                    onClearSearch();
                    history.push(`/contacts?contactGroupID=${contactGroupID}`);
                }
            }))
        );
    }

    const mobileLinks = [
        { to: '/inbox', icon: 'protonmail', external: true, current: false },
        { to: '/contacts', icon: 'protoncontacts', external: false, current: true }
    ];

    return (
        <Sidebar
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            url={url}
            list={list.filter(Boolean)}
            mobileLinks={mobileLinks}
        >
            <div className="pl1 pr1 nomobile">
                <PrimaryButton
                    className="pm-button--large bold mt0-25 w100"
                    onClick={() => createModal(<ContactModal history={history} />)}
                >{c('Action').t`Add contact`}</PrimaryButton>
            </div>
        </Sidebar>
    );
};

PrivateSidebar.propTypes = {
    url: PropTypes.string,
    user: PropTypes.object,
    totalContacts: PropTypes.number,
    contactGroups: PropTypes.array,
    expanded: PropTypes.bool,
    onToggleExpand: PropTypes.func,
    userKeysList: PropTypes.array,
    loadingUserKeys: PropTypes.bool,
    history: PropTypes.object.isRequired,
    onClearSearch: PropTypes.func
};

export default PrivateSidebar;
