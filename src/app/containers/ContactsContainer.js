import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    Loader,
    useContactEmails,
    useContacts,
    useUser,
    useUserKeys,
    useContactGroups,
    useActiveBreakpoint,
    useModals,
    useToggle,
    ErrorBoundary,
    GenericError
} from 'react-components';
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
import DeleteModal from '../components/delete/DeleteModal';
import PrivateLayout from '../content/PrivateLayout';

const ContactsContainer = ({ location, history }) => {
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { createModal } = useModals();
    const [search, updateSearch] = useState('');
    const normalizedSearch = normalize(search);
    const [contactEmails, loadingContactEmails] = useContactEmails();
    const [contacts, loadingContacts] = useContacts();
    const [contactGroups, loadingContactGroups] = useContactGroups();
    const [checkedContacts, setCheckedContacts] = useState(Object.create(null));
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);

    const { isDesktop, isNarrow } = useActiveBreakpoint();

    const contactID = useMemo(() => {
        const [, contactID] = location.pathname.split('/contacts/');
        return contactID;
    }, [location]);

    const contactGroupID = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('contactGroupID');
    }, [location.search]);

    const { contactGroupName, totalContactsInGroup } = useMemo(() => {
        if (!contactGroups || !contactGroupID) {
            return Object.create(null);
        }
        const contactGroup = contactGroups.find(({ ID }) => ID === contactGroupID);
        return {
            contactGroupName: contactGroup.Name,
            totalContactsInGroup: contacts.filter(({ LabelIDs = [] }) => LabelIDs.includes(contactGroupID)).length
        };
    }, [contacts, contactGroupID]);

    const hasChecked = useMemo(() => {
        return Object.keys(checkedContacts).some((key) => checkedContacts[key]);
    }, [checkedContacts]);

    useEffect(() => {
        // clean checked contacts if navigating to a contact group
        setCheckedContacts(Object.create(null));
        setExpand(false);
        // clean also the search
        updateSearch('');
    }, [contactGroupID]);

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

    const contactGroupsMap = useMemo(() => toMap(contactGroups), [contactGroups]);

    const filteredContacts = useMemo(() => {
        if (!Array.isArray(contacts)) {
            return [];
        }
        return contacts.filter(({ Name, ID, LabelIDs }) => {
            const emails = contactEmailsMap[ID] ? contactEmailsMap[ID].map(({ Email }) => Email).join(' ') : '';
            const searchFilter = normalizedSearch.length
                ? normalize(`${Name} ${emails}`).includes(normalizedSearch)
                : true;

            const groupFilter = contactGroupID ? LabelIDs.includes(contactGroupID) : true;

            return searchFilter && groupFilter;
        });
    }, [contacts, contactGroupID, normalizedSearch, contactEmailsMap]);

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

    const filteredCheckedIDs = useMemo(() => {
        return formattedContacts.filter(({ isChecked }) => isChecked).map(({ ID }) => ID);
    }, [formattedContacts, contactID]);

    const hasCheckedAllFiltered = useMemo(() => {
        const filteredContactsLength = filteredContacts.length;
        return !!filteredContactsLength && filteredCheckedIDs.length === filteredContactsLength;
    }, [filteredContacts, filteredCheckedIDs]);

    const activeIDs = useMemo(() => {
        {
            return !filteredCheckedIDs.length && contactID ? [contactID] : filteredCheckedIDs;
        }
    }, [filteredCheckedIDs, contactID]);

    const handleCheck = (contactIDs = [], checked = false) => {
        const update = contactIDs.reduce((acc, contactID) => {
            acc[contactID] = checked;
            return acc;
        }, Object.create(null));
        setCheckedContacts({ ...checkedContacts, ...update });
    };

    const handleClearSearch = () => {
        updateSearch('');
    };

    const handleCheckAllFiltered = (checked = false) => {
        handleCheck(
            filteredContacts.map(({ ID }) => ID),
            checked
        );
    };

    const handleUncheckAll = () => {
        handleCheckAllFiltered(false);
    };

    const handleDelete = () => {
        const deleteAll = activeIDs.length === contacts.length;
        const onDelete = () => {
            if (deleteAll) {
                history.replace({ ...location, state: { ignoreClose: true }, pathname: '/contacts' });
                return setCheckedContacts(Object.create(null));
            }
            if (activeIDs.length === filteredContacts.length) {
                handleClearSearch();
            }
            if (contactID && activeIDs.includes(contactID)) {
                history.replace({ ...location, state: { ignoreClose: true }, pathname: '/contacts' });
            }
            handleCheck(filteredCheckedIDs, false);
        };
        createModal(<DeleteModal contactIDs={activeIDs} deleteAll={deleteAll} onDelete={onDelete} />);
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
    const handleGroups = () => history.replace('/contacts/settings/groups');

    const isLoading = loadingContactEmails || loadingContacts || loadingContactGroups || loadingUserKeys;
    const contactsLength = contacts ? contacts.length : 0;
    const noHeader = isNarrow && contactID ? '--noHeader' : '';

    const contactComponent = contactID && !!contactsLength && !hasChecked && (
        <ErrorBoundary key={contactID} component={<GenericError className="pt2 view-column-detail flex-item-fluid" />}>
            <Contact
                contactID={contactID}
                contactEmails={contactEmailsMap[contactID]}
                contactGroupsMap={contactGroupsMap}
                userKeysList={userKeysList}
            />
        </ErrorBoundary>
    );

    const contactsListComponent = (isDesktop || !contactComponent) && (
        <ContactsList
            emptyAddressBook={!contactsLength}
            contactID={contactID}
            contactGroupID={contactGroupID}
            totalContacts={contactsLength}
            totalContactsInGroup={totalContactsInGroup}
            contacts={formattedContacts}
            contactGroupsMap={contactGroupsMap}
            user={user}
            userKeysList={userKeysList}
            loadingUserKeys={loadingUserKeys}
            onCheck={handleCheck}
            onClearSearch={handleClearSearch}
            onClearSelection={handleUncheckAll}
            isDesktop={isDesktop}
        />
    );

    const contactPlaceHolderComponent = isDesktop && !contactComponent && !!formattedContacts.length && (
        <ContactPlaceholder
            history={history}
            user={user}
            userKeysList={userKeysList}
            loadingUserKeys={loadingUserKeys}
            totalContacts={contactsLength}
            totalContactsInGroup={totalContactsInGroup}
            selectedContacts={filteredCheckedIDs.length}
            contactGroupID={contactGroupID}
            contactGroupName={contactGroupName}
            onUncheck={handleUncheckAll}
            canMerge={canMerge}
            onMerge={handleMerge}
            onImport={handleImport}
            onExport={handleExport}
            onGroups={handleGroups}
        />
    );

    const title = search === '' ? c('Title').t`Contacts` : c('Title').t`Search`;

    return (
        <PrivateLayout title={contactGroupName || c('Title').t`Contacts`}>
            {(!isNarrow || !contactID) && (
                <PrivateHeader
                    title={title}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                    search={search}
                    onSearch={updateSearch}
                    onClearSearch={handleClearSearch}
                    isNarrow={isNarrow}
                    history={history}
                />
            )}
            <div className="flex flex-nowrap">
                <PrivateSidebar
                    url="/contacts"
                    history={history}
                    user={user}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                    onClearSearch={handleClearSearch}
                    totalContacts={contactsLength}
                    contactGroups={contactGroups}
                    userKeysList={userKeysList}
                />
                <div className="main flex-item-fluid">
                    <ContactToolbar
                        user={user}
                        contactEmailsMap={contactEmailsMap}
                        activeIDs={activeIDs}
                        checked={hasCheckedAllFiltered}
                        onCheck={handleCheckAllFiltered}
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
