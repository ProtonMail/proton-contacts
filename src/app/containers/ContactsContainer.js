import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {
    Loader,
    useContactEmails,
    useContacts,
    useUser,
    useUserKeys,
    useApi,
    useNotifications,
    useEventManager,
    useContactGroups
} from 'react-components';
import { clearContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { normalize } from 'proton-shared/lib/helpers/string';

import ContactsList from '../components/ContactsList';
import Contact from '../components/Contact';
import ContactPlaceholder from '../components/ContactPlaceholder';
import ContactToolbar from '../components/ContactToolbar';
import AuthHeader from '../content/AuthHeader';
import AuthSidebar from '../content/AuthSidebar';

const ContactsContainer = ({ location }) => {
    const [search, updateSearch] = useState('');
    const normalizedSearch = normalize(search);
    const api = useApi();
    const { createNotification } = useNotifications();
    const { call } = useEventManager();
    const params = new URLSearchParams(location.search);
    const contactGroupID = params.get('contactGroupID');
    const [checkAll, setCheckAll] = useState(false);
    const [contactEmails, loadingContactEmails] = useContactEmails();
    const [contacts, loadingContacts] = useContacts();
    const [contactGroups, loadingContactGroups] = useContactGroups();
    const [checkedContacts, setCheckedContacts] = useState(Object.create(null));
    const hasChecked = Object.entries(checkedContacts).some(([, isChecked]) => isChecked);
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

    if (loadingContactEmails || loadingContacts || loadingUserKeys || loadingContactGroups) {
        return <Loader />;
    }

    const getCheckedContactIDs = () => {
        return Object.entries(checkedContacts).reduce((acc, [contactID, isChecked]) => {
            if (!isChecked) {
                return acc;
            }
            acc.push(contactID);
            return acc;
        }, []);
    };

    const handleDelete = async () => {
        await api(checkAll ? clearContacts : deleteContacts(getCheckedContactIDs()));
        await call();
        setCheckedContacts(Object.create(null));
        setCheckAll(false);
        createNotification({ text: c('Success').t`Contacts deleted` });
    };

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
        .filter(({ Email, Name }) => {
            if (normalizedSearch.length) {
                return normalize(`${Name} ${Email}`).includes(normalizedSearch);
            }
            return true;
        })
        .map((contact) => {
            const { ID } = contact;
            const emails = contactEmails.filter(({ ContactID }) => ContactID === ID).map(({ Email }) => Email);
            return {
                ...contact,
                emails,
                isChecked: !!checkedContacts[ID]
            };
        });

    return (
        <>
            <AuthHeader search={search} onSearch={updateSearch} />
            <div className="flex flex-nowrap">
                <Route path="/:path" render={() => <AuthSidebar contactGroups={contactGroups} />} />
                <div className="main flex-item-fluid main-area">
                    <ContactToolbar
                        checkedContacts={checkedContacts}
                        checked={checkAll}
                        onCheck={handleCheckAll}
                        onDelete={handleDelete}
                    />
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
                </div>
            </div>
        </>
    );
};

ContactsContainer.propTypes = {
    location: PropTypes.object.isRequired
};

export default ContactsContainer;
