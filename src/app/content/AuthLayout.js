import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router';
import { Sidebar, useContactGroups, Loader } from 'react-components';

import AuthHeader from './AuthHeader';

const AuthLayout = ({ children }) => {
    const [contactGroups, loading] = useContactGroups();

    if (loading) {
        return <Loader />;
    }

    const list = contactGroups.map(({ Name, Color, ID }) => ({
        icon: 'contacts-groups',
        color: Color,
        text: Name,
        link: `/contacts/group/${ID}`
    }));

    return (
        <>
            <AuthHeader />
            <div className="flex flex-nowrap">
                <Route path="/:path" render={() => <Sidebar list={list} />} />
                <div className="main flex-item-fluid main-area">
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
