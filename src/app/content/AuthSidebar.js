import React from 'react';
import { Sidebar, useContactGroups, Loader } from 'react-components';
import { c } from 'ttag';

const AuthSidebar = () => {
    const [contactGroups, loading] = useContactGroups();

    if (loading) {
        return <Loader />;
    }

    const list = [
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
        contactGroups.map(({ Name, Color, ID }) => ({
            icon: 'contacts-groups',
            color: Color,
            text: Name,
            link: `/contacts/group/${ID}`
        }))
    );

    return <Sidebar list={list} />;
};

export default AuthSidebar;
