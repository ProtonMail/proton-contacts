import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router';
import { Sidebar, useContactGroups, Loader } from 'react-components';
import { c } from 'ttag';

import AuthHeader from './AuthHeader';

const AuthLayout = ({ children }) => {
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
            icon: 'import',
            text: c('Action').t`Import`,
            type: 'button',
            onClick() {}
        },
        {
            icon: 'export',
            text: c('Action').t`Export`,
            type: 'button',
            onClick() {}
        },
        {
            icon: 'merge',
            text: c('Action').t`Merge`,
            type: 'button',
            onClick() {}
        },
        {
            icon: 'delete',
            text: c('Action').t`Delete all`,
            type: 'button',
            onClick() {}
        },
        {
            icon: 'contacts-group',
            text: c('Link').t`Group`,
            type: 'button',
            onClick() {}
        }
    ].concat(
        contactGroups.map(({ Name, Color, ID }) => ({
            icon: 'contacts-groups',
            color: Color,
            text: Name,
            link: `/contacts/group/${ID}`
        }))
    );

    return (
        <>
            <AuthHeader />
            <div className="flex flex-nowrap">
                <Route path="/:path" render={() => <Sidebar list={list} />} />
                <div className="main flex-item-fluid main-area">
                    <div className="toolbar noprint" />
                    <div className="flex flex-nowrap">{children}</div>
                </div>
            </div>
        </>
    );
};

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired
};

export default AuthLayout;
