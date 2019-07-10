import React from 'react';
import { Sidebar, useContactGroups, Loader, useModals, useContacts } from 'react-components';
import { c } from 'ttag';

import ContactModal from '../components/ContactModal';
import { extract } from '../helpers/merge';
import ContactGroupModal from '../components/ContactGroupModal';
import ContactGroupsModal from '../components/ContactGroupsModal';

const AuthSidebar = () => {
    const [contacts, loadingContacts] = useContacts();
    const [contactGroups, loadingContactGroups] = useContactGroups();
    const { createModal } = useModals();
    const emails = extract(contacts);
    const duplicates = Object.keys(emails).reduce((acc, key) => acc + emails[key].length, 0);
    const canMerge = duplicates > 0;

    if (loadingContacts || loadingContactGroups) {
        return <Loader />;
    }

    const list = [
        {
            icon: 'plus',
            text: c('Action').t`Add contact`,
            type: 'button',
            onClick() {
                createModal(<ContactModal />);
            }
        },
        {
            icon: 'contacts',
            text: c('Link').t`Contacts`,
            link: '/contacts'
        },
        {
            icon: 'contacts-group',
            text: c('Link').t`Group`,
            type: 'button',
            onClick() {
                createModal(<ContactGroupsModal />);
            }
        }
    ].concat(
        contactGroups.map(({ Name: text, Color: color, ID: contactGroupID }) => ({
            icon: 'contacts-groups',
            color,
            text,
            link: `/contacts?contactGroupID=${contactGroupID}`
        }))
    );

    list.push({
        icon: 'add',
        text: c('Link').t`Add group`,
        type: 'button',
        onClick() {
            createModal(<ContactGroupModal />);
        }
    });

    if (canMerge) {
        list.splice(2, 0, {
            icon: 'merge',
            text: c('Action').t`Merge`,
            type: 'button',
            onClick() {}
        });
    }

    return <Sidebar list={list} />;
};

export default AuthSidebar;
