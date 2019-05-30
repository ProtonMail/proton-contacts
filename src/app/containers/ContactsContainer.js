import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import ContactsList from '../components/ContactsList';
import ContactView from '../components/ContactView';
import ContactPlaceholder from '../components/ContactPlaceholder';

const ContactsContainer = () => {
    return (
        <>
            <ContactsList />
            <Router>
                <Switch>
                    <Route path="/contacts/:id" component={ContactView} />
                    <Route component={ContactPlaceholder} />
                </Switch>
            </Router>
        </>
    );
};

export default ContactsContainer;
