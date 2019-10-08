import React from 'react';
import PropTypes from 'prop-types';
import { SettingsTitle } from 'react-components';

const SettingsPage = ({ title, children }) => {
    return (
        <main className="main-area-content bg-white relative flex-item-fluid">
            <SettingsTitle>{title}</SettingsTitle>
            <div className="container-section-sticky">{children}</div>
        </main>
    );
};

SettingsPage.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
};

export default SettingsPage;
