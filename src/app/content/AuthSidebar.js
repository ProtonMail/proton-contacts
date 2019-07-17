import React from 'react';
import { NavMenu, useModals, PrimaryButton } from 'react-components';
import { c } from 'ttag';
import PropTypes from 'prop-types';

import ContactModal from '../components/ContactModal';
import { extract } from '../helpers/merge';
import ContactGroupModal from '../components/ContactGroupModal';
import ContactGroupsModal from '../components/ContactGroupsModal';

const AuthSidebar = ({ contacts, contactGroups }) => {
    const { createModal } = useModals();
    const emails = extract(contacts);
    const duplicates = Object.keys(emails).reduce((acc, key) => acc + emails[key].length, 0);
    const canMerge = duplicates > 0;

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
        {
            icon: 'contacts-group',
            text: c('Link').t`Group`,
            type: 'button',
            className: 'alignleft',
            onClick() {
                createModal(<ContactGroupsModal />);
            }
        }
    ].concat(
        contactGroups.map(({ Name: text, Color: color, ID: contactGroupID }) => ({
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

    list.push({
        icon: 'add',
        text: c('Link').t`Add group`,
        type: 'button',
        className: 'alignleft',
        onClick() {
            createModal(<ContactGroupModal />);
        }
    });

    if (canMerge) {
        list.splice(2, 0, {
            icon: 'merge',
            text: c('Action').t`Merge`,
            type: 'button',
            className: 'alignleft',
            onClick() {
                // TODO
            }
        });
    }

    return (
        <div className="sidebar flex flex-column noprint">
            <div className="pl1 pr1">
                <PrimaryButton className="w100" onClick={() => createModal(<ContactModal />)}>{c('Action')
                    .t`Add contact`}</PrimaryButton>
            </div>
            <nav className="navigation flex-item-fluid scroll-if-needed mb1">
                <NavMenu list={list} />
            </nav>
        </div>
    );
};

AuthSidebar.propTypes = {
    contacts: PropTypes.array,
    contactGroups: PropTypes.array
};

export default AuthSidebar;
