import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Loader, useContactEmails, useContacts, useUser, useUserKeys } from 'react-components';

import ContactsList from '../components/ContactsList';
import Contact from '../components/Contact';
import ContactPlaceholder from '../components/ContactPlaceholder';

const ContactsContainer = () => {
    const [contactEmails, loadingContactEmails] = useContactEmails();
    const [contacts, loadingContacts] = useContacts();
    const [checkedContacts, setCheckedContacts] = useState(Object.create(null));
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

    if (loadingContactEmails || loadingContacts || loadingUserKeys) {
        return <Loader />;
    }

    const handleCheck = (contactIDs, checked) => {
        const update = contactIDs.reduce((acc, contactID) => {
            acc[contactID] = checked;
            return acc;
        }, Object.create(null));
        setCheckedContacts({ ...checkedContacts, ...update });
    };

    const formattedContacts = contacts.map((contact) => {
        const { ID } = contact;
        const emails = contactEmails.filter(({ ContactID }) => ContactID === ID).map(({ Email }) => Email);
        return { ...contact, emails, isChecked: !!checkedContacts[ID] };
    });

    return (
        <>
            <Router>
                <Switch>
                    <Route
                        path="/contacts/:id"
                        component={({ match }) => {
                            return (
                                <>
                                    <ContactsList
                                        contactID={match.params.id}
                                        contacts={formattedContacts}
                                        onCheck={handleCheck}
                                    />
                                    <Contact contactID={match.params.id} userKeysList={userKeysList} />
                                </>
                            );
                        }}
                    />
                    <Route
                        component={() => {
                            return (
                                <>
                                    <ContactsList contacts={formattedContacts} onCheck={handleCheck} />
                                    <ContactPlaceholder />
                                </>
                            );
                        }}
                    />
                </Switch>
            </Router>
        </>
    );
};

export default ContactsContainer;
