import React from 'react';
import { NavMenu, useModals, PrimaryButton, useUserKeys } from 'react-components';
import { c } from 'ttag';
import PropTypes from 'prop-types';

import ContactModal from '../components/ContactModal';
import ImportModal from '../components/import/ImportModal';
import ExportModal from '../components/ExportModal';
import UpgradeModal from '../components/UpgradeModal';

const PrivateSidebar = ({ user, contactGroups, history }) => {
    const { hasPaidMail } = user;
    const { createModal } = useModals();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

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
        !loadingUserKeys && {
            type: 'button',
            className: 'alignleft',
            icon: 'export',
            text: c('Link').t`Export`,
            onClick() {
                createModal(<ExportModal userKeysList={userKeysList} />);
            }
        },
        {
            type: 'button',
            className: 'alignleft',
            icon: 'general',
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
                isActive(match, location) {
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
        <div className="sidebar flex flex-column noprint">
            <div className="pl1 pr1">
                <PrimaryButton className="w100" onClick={() => createModal(<ContactModal />)}>{c('Action')
                    .t`Add contact`}</PrimaryButton>
            </div>
            <nav className="navigation mw100 flex-item-fluid scroll-if-needed mb1">
                <NavMenu list={list.filter(Boolean)} />
            </nav>
        </div>
    );
};

PrivateSidebar.propTypes = {
    user: PropTypes.object,
    contactGroups: PropTypes.array,
    history: PropTypes.object.isRequired
};

export default PrivateSidebar;
