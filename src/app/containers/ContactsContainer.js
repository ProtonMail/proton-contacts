import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Loader, useContactEmails, useContacts, useUser, useUserKeys } from 'react-components';

import ContactsList from '../components/ContactsList';
import Contact from '../components/Contact';
import ContactPlaceholder from '../components/ContactPlaceholder';
import ContactToolbar from '../components/ContactToolbar';

const ContactsContainer = ({ location }) => {
    const params = new URLSearchParams(location.search);
    const contactGroupID = params.get('contactGroupID');
    const [checkAll, setCheckAll] = useState(false);
    const [contactEmails, loadingContactEmails] = useContactEmails();
    const [contacts, loadingContacts] = useContacts();
    const [checkedContacts, setCheckedContacts] = useState(Object.create(null));
    const hasChecked = Object.entries(checkedContacts).some(([, isChecked]) => isChecked);
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

    if (loadingContactEmails || loadingContacts || loadingUserKeys) {
        return <Loader />;
    }

    const handleDelete = () => {};

    const handleCheckAll = (checked = false) => handleCheck(contacts.map(({ ID }) => ID), checked);
    const handleUncheckAll = () => handleCheckAll(false);

    const handleCheck = (contactIDs = [], checked = false) => {
        const update = contactIDs.reduce((acc, contactID) => {
            acc[contactID] = checked;
            return acc;
        }, Object.create(null));
        setCheckedContacts({ ...checkedContacts, ...update });
        setCheckAll(checked && contactIDs.length === contacts.length);
    };

    const formattedContacts = contacts
        .filter(({ LabelIDs = [] }) => {
            if (!contactGroupID) {
                return true;
            }
            return LabelIDs.includes(contactGroupID);
        })
        .map((contact) => {
            const { ID } = contact;
            const emails = contactEmails.filter(({ ContactID }) => ContactID === ID).map(({ Email }) => Email);
            return { ...contact, emails, isChecked: !!checkedContacts[ID] };
        });

    return (
        <>
            <ContactToolbar checked={checkAll} onCheck={handleCheckAll} onDelete={handleDelete} />
            <div className="flex flex-nowrap">
                <Router>
                    <Switch>
                        <Route
                            path="/contacts/:contactID"
                            component={({ match }) => {
                                const { contactID } = match.params;
                                return (
                                    <>
                                        <ContactsList
                                            contactID={contactID}
                                            contacts={formattedContacts}
                                            onCheck={handleCheck}
                                        />
                                        {hasChecked ? (
                                            <ContactPlaceholder
                                                user={user}
                                                contactGroupID={contactGroupID}
                                                contacts={formattedContacts}
                                                onUncheck={handleUncheckAll}
                                            />
                                        ) : (
                                            <Contact contactID={contactID} userKeysList={userKeysList} />
                                        )}
                                    </>
                                );
                            }}
                        />
                        <Route
                            component={() => {
                                return (
                                    <>
                                        <ContactsList contacts={formattedContacts} onCheck={handleCheck} />
                                        <ContactPlaceholder
                                            user={user}
                                            contactGroupID={contactGroupID}
                                            contacts={formattedContacts}
                                            onUncheck={handleUncheckAll}
                                        />
                                    </>
                                );
                            }}
                        />
                    </Switch>
                </Router>
            </div>
        </>
    );
};

ContactsContainer.propTypes = {
    location: PropTypes.object.isRequired
};

export default ContactsContainer;
