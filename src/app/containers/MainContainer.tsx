import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { ErrorBoundary, useWelcomeFlags } from 'react-components';

import SettingsContainer from './SettingsContainer';
import ContactsContainer from './ContactsContainer';
import ContactsOnboardingContainer from './ContactsOnboardingContainer';

const MainContainer = () => {
    const [welcomeFlags, setWelcomeFlagsDone] = useWelcomeFlags();

    if (welcomeFlags.isWelcomeFlow) {
        return <ContactsOnboardingContainer onDone={setWelcomeFlagsDone} />;
    }

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
