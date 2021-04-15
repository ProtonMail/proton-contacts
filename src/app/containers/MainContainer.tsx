import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { ErrorBoundary, StandardErrorPage, useWelcomeFlags } from 'react-components';

import ContactsContainer from './ContactsContainer';
import ContactsOnboardingContainer from './ContactsOnboardingContainer';

const MainContainer = () => {
    const [welcomeFlags, setWelcomeFlagsDone] = useWelcomeFlags();

    if (welcomeFlags.isWelcomeFlow) {
        return <ContactsOnboardingContainer onDone={setWelcomeFlagsDone} />;
    }

    return (
        <Switch>
            <Route path="/">
                <ContactsContainer />
            </Route>
            <Redirect to="/" />
        </Switch>
    );
};

const WrappedMainContainer = () => {
    return (
        <ErrorBoundary component={<StandardErrorPage />}>
            <MainContainer />
        </ErrorBoundary>
    );
};

export default WrappedMainContainer;
