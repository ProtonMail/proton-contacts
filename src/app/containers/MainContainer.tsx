import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { ErrorBoundary } from 'react-components';

import SettingsContainer from './SettingsContainer';
import ContactsContainer from './ContactsContainer';

const MainContainer = () => {
    return (
        <ErrorBoundary>
            <Switch>
                <Route path="/settings" component={SettingsContainer} />
                <Route
                    path="/"
                    render={({ location, history }) => <ContactsContainer location={location} history={history} />}
                />
                <Redirect to="/" />
            </Switch>
        </ErrorBoundary>
    );
};

export default MainContainer;
