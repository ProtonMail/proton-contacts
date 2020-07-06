import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import { StandardPublicApp, MinimalLoginContainer, ModalsChildren } from 'react-components';
import locales from '../locales';

const PublicApp = ({ onLogin }) => {
    return (
        <StandardPublicApp locales={locales}>
            <ModalsChildren />
            <Switch>
                <Route render={() => <MinimalLoginContainer onLogin={onLogin} />} />
            </Switch>
        </StandardPublicApp>
    );
};

PublicApp.propTypes = {
    onLogin: PropTypes.func.isRequired
};

export default PublicApp;
