import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import { ErrorBoundary } from 'react-components';

import AuthLayout from './AuthLayout.js';
import ContactsContainer from '../containers/ContactsContainer';

const NotFoundContainer = () => <h1>Not found</h1>;

const Routes = () => {
    return (
        <Router>
            <AuthLayout>
                <Route
                    render={({ location }) => (
                        <ErrorBoundary key={location.key}>
                            <Switch>
                                <Route path="/contacts/:contactGroupID" component={ContactsContainer} />
                                <Route component={NotFoundContainer} />
                            </Switch>
                        </ErrorBoundary>
                    )}
                />
            </AuthLayout>
        </Router>
    );
};

export default hot(Routes);
