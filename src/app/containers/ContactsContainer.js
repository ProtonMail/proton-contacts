import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { Route, Switch, withRouter } from 'react-router-dom';
import {
    AppsSidebar,
    Alert,
    Loader,
    useContactEmails,
    useContacts,
    useUser,
    useUserKeys,
    useApi,
    useNotifications,
    useEventManager,
    useContactGroups,
    useModals,
    ConfirmModal
} from 'react-components';
import { clearContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { normalize } from 'proton-shared/lib/helpers/string';
import { APPS } from 'proton-shared/lib/constants';

import ContactsList from '../components/ContactsList';
import Contact from '../components/Contact';
import ContactPlaceholder from '../components/ContactPlaceholder';
import ContactToolbar from '../components/ContactToolbar';
import PrivateHeader from '../content/PrivateHeader';
import PrivateSidebar from '../content/PrivateSidebar';

const ContactsContainer = ({ location, history }) => {
    const { createModal } = useModals();
    const [search, updateSearch] = useState('');
    const normalizedSearch = normalize(search);
    const api = useApi();
    const { createNotification } = useNotifications();
    const { call } = useEventManager();
    const [checkAll, setCheckAll] = useState(false);
    const [contactEmails, loadingContactEmails] = useContactEmails();
    const [contacts, loadingContacts] = useContacts();
    const [contactGroups, loadingContactGroups] = useContactGroups();
    const [checkedContacts, setCheckedContacts] = useState(Object.create(null));
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

    const contactGroupID = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('contactGroupID');
    }, [location.search]);

    const hasChecked = useMemo(() => {
        return Object.keys(checkedContacts).some((key) => checkedContacts[key]);
    }, [checkedContacts]);

    const filteredContacts = useMemo(() => {
        if (!Array.isArray(contacts)) {
            return [];
        }
        return contacts.filter(({ Name, Email, LabelIDs }) => {
            const searchFilter = normalizedSearch.length
                ? normalize(`${Name} ${Email}`).includes(normalizedSearch)
                : true;

            const groupFilter = contactGroupID ? LabelIDs.includes(contactGroupID) : true;

            return searchFilter && groupFilter;
        });
    }, [contacts, contactGroupID, normalizedSearch]);

    const contactEmailsMap = useMemo(() => {
        if (!Array.isArray(contactEmails)) {
            return {};
        }
        return contactEmails.reduce((acc, contactEmail) => {
            const { ContactID } = contactEmail;
            if (!acc[ContactID]) {
                acc[ContactID] = [];
            }
            acc[ContactID].push(contactEmail);
            return acc;
        }, Object.create(null));
    }, [contactEmails]);

    const formattedContacts = useMemo(() => {
        return filteredContacts.map((contact) => {
            const { ID } = contact;
            return {
                ...contact,
                emails: (contactEmailsMap[ID] || []).map(({ Email }) => Email),
                isChecked: !!checkedContacts[ID]
            };
        });
    }, [filteredContacts, checkedContacts, contactEmailsMap]);

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

    const getCurrentContactID = () => {
        const [, contactID] = location.pathname.split('/contacts/');
        return contactID;
    };

    const getContactIDsToDelete = () => {
        const checkedContactIDs = getCheckedContactIDs();
        if (checkedContactIDs.length) {
            return checkedContactIDs;
        }
        const currentContactID = getCurrentContactID();
        if (currentContactID) {
            return [currentContactID];
        }
    };

    const handleDelete = async () => {
        const contactIDs = getContactIDsToDelete();

        if (!Array.isArray(contactIDs) && !contactIDs.length) {
            return;
        }

        await new Promise((resolve, reject) => {
            createModal(
                <ConfirmModal title={c('Title').t`Delete`} onConfirm={resolve} onClose={reject}>
                    <Alert type="warning">
                        {c('Warning').ngettext(
                            msgid`Are you sure you want to delete the selected contact?`,
                            `Are you sure you want to delete the selected contacts?`,
                            contactIDs.length
                        )}
                    </Alert>
                </ConfirmModal>
            );
        });
        await api(checkAll && !contactGroupID ? clearContacts() : deleteContacts(contactIDs));
        history.replace('/contacts');
        await call();
        setCheckedContacts(Object.create(null));
        setCheckAll(false);
        createNotification({ text: c('Success').t`Contacts deleted` });
    };

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
            const Emails = contactEmails.filter(({ ContactID }) => ContactID === ID).map(({ Email }) => Email);
            return {
                ...contact,
                Emails,
                isChecked: !!checkedContacts[ID]
            };
        });

    return (
        <div className="flex flex-nowrap no-scroll">
            <AppsSidebar currentApp={APPS.PROTONCONTACTS} />
            <div className="content flex-item-fluid reset4print">
                <PrivateHeader search={search} onSearch={updateSearch} />
                <div className="flex flex-nowrap">
                    <Route path="/:path" render={() => <PrivateSidebar contactGroups={contactGroups} />} />
                    <div className="main flex-item-fluid main-area">
                        <ContactToolbar
                            checkedContacts={checkedContacts}
                            checked={checkAll}
                            onCheck={handleCheckAll}
                            onDelete={handleDelete}
                        />
                        <div className="flex flex-nowrap">
                            <Switch>
                                <Route
                                    path="/contacts/:contactID"
                                    render={({ match }) => {
                                        const { contactID } = match.params;
                                        return (
                                            <>
                                                <ContactsList
                                                    contactID={contactID}
                                                    contacts={formattedContacts}
                                                    onCheck={handleCheck}
                                                    userKeysList={userKeysList}
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
                                    render={() => {
                                        return (
                                            <>
                                                <ContactsList contacts={formattedContacts} onCheck={handleCheck} />
                                                <ContactPlaceholder
                                                    user={user}
                                                    userKeysList={userKeysList}
                                                    loadingUserKeys={loadingUserKeys}
                                                    contactGroupID={contactGroupID}
                                                    contacts={formattedContacts}
                                                    onUncheck={handleUncheckAll}
                                                />
                                            </>
                                        );
                                    }}
                                />
                            </Switch>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ContactsContainer.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

export default withRouter(ContactsContainer);
