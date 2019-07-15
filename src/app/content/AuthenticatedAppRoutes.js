import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import { ErrorBoundary } from 'react-components';

import ContactsContainer from '../containers/ContactsContainer';

const Routes = () => {
    return (
        <Router>
            <ErrorBoundary>
                <Route path="/contacts" component={ContactsContainer} />
            </ErrorBoundary>
        </Router>
    );
};

export default hot(Routes);
