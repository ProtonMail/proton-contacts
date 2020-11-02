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
                <Route path="/settings">
                    <SettingsContainer />
                </Route>
                <Route path="/">
                    <ContactsContainer />
                </Route>
                <Redirect to="/" />
            </Switch>
        </ErrorBoundary>
    );
};

export default MainContainer;
