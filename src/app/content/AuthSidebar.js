import React from 'react';
import { Sidebar, useContactGroups, Loader, useModals } from 'react-components';
import { c } from 'ttag';

import ContactModal from '../components/ContactModal';

const AuthSidebar = () => {
    const [contactGroups, loading] = useContactGroups();
    const { createModal } = useModals();

    if (loading) {
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
                // TODO open create contact group modal
            }
        }
    ].concat(
        contactGroups.map(({ Name: text, Color: color, ID: contactGroupID }) => ({
            icon: 'contacts-groups',
            color,
            text,
            link: `?contactGroupID=${contactGroupID}`
        }))
    );

    return <Sidebar list={list} />;
};

export default AuthSidebar;
