import React from 'react';
import PropTypes from 'prop-types';

import AuthHeader from './AuthHeader';

const AuthLayout = ({ children }) => {
    return (
        <>
            <AuthHeader />
            <div className="flex flex-nowrap">
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
