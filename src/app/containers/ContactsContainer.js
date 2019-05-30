import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Loader, useContactEmails, useContacts, useUser, useUserKeys } from 'react-components';

import ContactsList from '../components/ContactsList';
import Contact from '../components/Contact';
import ContactPlaceholder from '../components/ContactPlaceholder';

const ContactsContainer = () => {
    const [contactEmails, loadingContactEmails] = useContactEmails();
    const [contacts, loadingContacts] = useContacts();
    const [checkedContacts, setCheckedContacts] = useState({});
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

    if (loadingContactEmails || loadingContacts || loadingUserKeys) {
        return <Loader />;
    }

    const handleCheck = (contactID, checked) => {
        setCheckedContacts({ ...checkedContacts, [contactID]: checked });
    };

    const formattedContacts = contacts.map((contact) => {
        const { ID } = contact;
        const emails = contactEmails.filter(({ ContactID }) => ContactID === ID).map(({ Email }) => Email);
        return { ...contact, emails, isChecked: !!checkedContacts[ID] };
    });

    return (
        <>
            <ContactsList contacts={formattedContacts} onCheck={handleCheck} />
            <Router>
                <Switch>
                    <Route
                        path="/contacts/:id"
                        component={({ match }) => <Contact id={match.params.id} userKeysList={userKeysList} />}
                    />
                    <Route component={ContactPlaceholder} />
                </Switch>
            </Router>
        </>
    );
};

export default ContactsContainer;
