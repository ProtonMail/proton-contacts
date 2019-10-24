import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import {
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
    useActiveBreakpoint,
    useModals,
    ConfirmModal,
    ErrorButton,
    useToggle
} from 'react-components';
import { clearContacts, deleteContacts } from 'proton-shared/lib/api/contacts';
import { normalize } from 'proton-shared/lib/helpers/string';
import { toMap } from 'proton-shared/lib/helpers/object';
import { extractMergeable } from '../helpers/merge';

import ContactsList from '../components/ContactsList';
import Contact from '../components/Contact';
import ContactPlaceholder from '../components/ContactPlaceholder';
import ContactToolbar from '../components/ContactToolbar';
import PrivateHeader from '../content/PrivateHeader';
import PrivateSidebar from '../content/PrivateSidebar';
import MergeModal from '../components/merge/MergeModal';
import ImportModal from '../components/import/ImportModal';
import ExportModal from '../components/ExportModal';
import PrivateLayout from '../content/PrivateLayout';

const ContactsContainer = ({ location, history }) => {
    const { state: expanded, toggle: onToggleExpand } = useToggle();
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

    const { isDesktop, isNarrow } = useActiveBreakpoint();
    const noHeader = isNarrow ? '--noHeader' : '';

    const contactGroupID = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('contactGroupID');
    }, [location.search]);

    const hasChecked = useMemo(() => {
        return Object.keys(checkedContacts).some((key) => checkedContacts[key]);
    }, [checkedContacts]);

    useEffect(() => {
        // clean checked contacts if navigating to a contact group
        setCheckedContacts(Object.create(null));
        setCheckAll(false);
    }, [contactGroupID]);

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

    const contactGroupsMap = useMemo(() => toMap(contactGroups && contactGroups.filter(Boolean)), [contactGroups]);

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

    const mergeableContacts = useMemo(() => extractMergeable(formattedContacts), [formattedContacts]);
    const canMerge = mergeableContacts.length > 0;
    const { hasPaidMail } = user;

    const checkedContactIDs = useMemo(() => {
        return Object.entries(checkedContacts).reduce((acc, [contactID, isChecked]) => {
            if (!isChecked) {
                return acc;
            }
            acc.push(contactID);
            return acc;
        }, []);
    }, [checkedContacts]);

    const contactID = useMemo(() => {
        const [, contactID] = location.pathname.split('/contacts/');
        return contactID;
    }, [location]);

    const activeIDs = useMemo(() => {
        if (checkedContactIDs && checkedContactIDs.length) {
            return checkedContactIDs;
        }
        if (contactID) {
            return [contactID];
        }
        return [];
    }, [checkedContactIDs, contactID]);

    const handleDelete = async () => {
        const confirm = <ErrorButton type="submit">{c('Action').t`Delete`}</ErrorButton>;
        await new Promise((resolve, reject) => {
            createModal(
                <ConfirmModal title={c('Title').t`Delete`} onConfirm={resolve} confirm={confirm} onClose={reject}>
                    <Alert type="warning">
                        {c('Warning').ngettext(
                            msgid`This action will permanently delete the selected contact. Are you sure you want to delete this contact?`,
                            `This action will permanently delete selected contacts. Are you sure you want to delete these contacts?`,
                            activeIDs.length
                        )}
                    </Alert>
                </ConfirmModal>
            );
        });
        await api(checkAll && !contactGroupID ? clearContacts() : deleteContacts(activeIDs));
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

    const handleClearSearch = () => {
        updateSearch('');
    };

    const handleCheckAll = (checked = false) => {
        if (!Array.isArray(contacts)) {
            return;
        }
        handleCheck(contacts.map(({ ID }) => ID), checked);
    };

    const handleUncheckAll = () => {
        handleCheckAll(false);
    };

    const handleMerge = () => {
        createModal(
            <MergeModal
                contacts={mergeableContacts}
                contactID={contactID}
                userKeysList={userKeysList}
                hasPaidMail={!!hasPaidMail}
            />
        );
    };
    const handleImport = () => createModal(<ImportModal userKeysList={userKeysList} />);
    const handleExport = (contactGroupID) =>
        createModal(<ExportModal contactGroupID={contactGroupID} userKeysList={userKeysList} />);
    const handleGroups = () => history.push('/contacts/settings/groups');

    const isLoading = loadingContactEmails || loadingContacts || loadingContactGroups || loadingUserKeys;
    const contactsLength = contacts ? contacts.length : 0;

    const contactComponent = contactID && contactsLength && !hasChecked && (
        <Contact
            contactID={contactID}
            contactEmails={contactEmailsMap[contactID]}
            contactGroupsMap={contactGroupsMap}
            userKeysList={userKeysList}
        />
    );

    const contactsListComponent = (isDesktop || !contactComponent) && (
        <ContactsList
            emptyAddressBook={!contactsLength}
            contactID={contactID}
            totalContacts={contactsLength}
            contacts={formattedContacts}
            contactGroupsMap={contactGroupsMap}
            user={user}
            userKeysList={userKeysList}
            loadingUserKeys={loadingUserKeys}
            onCheck={handleCheck}
            onClear={handleClearSearch}
            isDesktop={isDesktop}
        />
    );

    const contactPlaceHolderComponent = isDesktop && !contactComponent && (
        <ContactPlaceholder
            history={history}
            user={user}
            userKeysList={userKeysList}
            loadingUserKeys={loadingUserKeys}
            contactGroupID={contactGroupID}
            totalContacts={contactsLength}
            contacts={formattedContacts}
            onUncheck={handleUncheckAll}
            canMerge={canMerge}
            onMerge={handleMerge}
            onImport={handleImport}
            onExport={handleExport}
            onGroups={handleGroups}
        />
    );

    return (
        <PrivateLayout>
            {(!isNarrow || !contactID) && (
                <PrivateHeader
                    title={c('Title').t`Contacts`}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                    search={search}
                    onSearch={updateSearch}
                    isNarrow={isNarrow}
                />
            )}
            <div className="flex flex-nowrap">
                <PrivateSidebar
                    url="/contacts"
                    history={history}
                    user={user}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                    totalContacts={contactsLength}
                    contactGroups={contactGroups}
                    userKeysList={userKeysList}
                />
                <div className={`main flex-item-fluid`}>
                    <ContactToolbar
                        user={user}
                        contactEmailsMap={contactEmailsMap}
                        activeIDs={activeIDs}
                        checked={checkAll}
                        onCheck={handleCheckAll}
                        onDelete={handleDelete}
                        simplified={!!contactID && !isDesktop}
                    />
                    <div className={`main-area--withToolbar${noHeader} no-scroll flex flex-nowrap`}>
                        {isLoading ? (
                            <Loader />
                        ) : (
                            <>
                                {contactsListComponent}
                                {contactComponent}
                                {contactPlaceHolderComponent}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PrivateLayout>
    );
};

ContactsContainer.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

export default ContactsContainer;
