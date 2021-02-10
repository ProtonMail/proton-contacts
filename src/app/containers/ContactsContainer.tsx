import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { c } from 'ttag';
import {
    Loader,
    useContactEmails,
    useContacts,
    useUser,
    useUserKeys,
    useContactGroups,
    useAddresses,
    useActiveBreakpoint,
    useModals,
    useToggle,
    ErrorBoundary,
    GenericError,
    useUserSettings,
    PrivateHeader,
    PrivateMainArea,
    PrivateAppContainer,
    useAppTitle,
    ContactContainer,
    ContactDeleteModal,
    FloatingButton,
    ContactModal,
    Searchbox,
    SearchDropdown,
    Icon,
    SettingsButton,
    MainLogo,
} from 'react-components';
import { normalize } from 'proton-shared/lib/helpers/string';
import { toMap } from 'proton-shared/lib/helpers/object';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import { Contact, ContactEmail } from 'proton-shared/lib/interfaces/contacts';
import { extractMergeable } from '../helpers/merge';
import ContactsList from '../components/ContactsList';
import ContactPlaceholder from '../components/ContactPlaceholder';
import ContactToolbar from '../components/ContactToolbar';
import ContactsSidebar from '../content/ContactsSidebar';
import MergeModal from '../components/merge/MergeModal';
import { FormattedContact } from '../interfaces/FormattedContact';

const ContactsContainer = () => {
    const history = useHistory();
    const location = useLocation();
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { createModal } = useModals();
    const { isDesktop, isNarrow } = useActiveBreakpoint();
    const [search, updateSearch] = useState('');
    const normalizedSearch = normalize(search);
    const [contactEmails, loadingContactEmails] = useContactEmails() as [ContactEmail[], boolean, any];
    const [contacts = [], loadingContacts] = useContacts() as [Contact[], boolean, any];
    const [contactGroups = [], loadingContactGroups] = useContactGroups();
    const [user] = useUser();
    const [userSettings, loadingUserSettings] = useUserSettings();
    const [userKeysList, loadingUserKeys] = useUserKeys();
    const [addresses = [], loadingAddresses] = useAddresses();

    const [checkedContacts, setCheckedContacts] = useState(Object.create(null));

    const contactID = useMemo(() => {
        const [, contactID] = location.pathname.split('/');
        return contactID;
    }, [location]);

    const contactGroupID = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('contactGroupID') || undefined;
    }, [location.search]);

    const { contactGroupName, totalContactsInGroup } = useMemo<{
        contactGroupName?: string;
        totalContactsInGroup?: number;
    }>(() => {
        if (!contactGroups.length || !contactGroupID) {
            return Object.create(null);
        }
        const contactGroup = contactGroups.find(({ ID }) => ID === contactGroupID);
        return {
            contactGroupName: contactGroup?.Name,
            totalContactsInGroup: contacts.filter(({ LabelIDs = [] }) => LabelIDs.includes(contactGroupID)).length,
        };
    }, [contacts, contactGroups, contactGroupID]);

    const ownAddresses = useMemo(() => addresses.map(({ Email }) => Email), [addresses]);

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
        return contactEmails.reduce<SimpleMap<ContactEmail[]>>((acc, contactEmail) => {
            const { ContactID } = contactEmail;
            if (!acc[ContactID]) {
                acc[ContactID] = [];
            }
            (acc[ContactID] as ContactEmail[]).push(contactEmail);
            return acc;
        }, Object.create(null));
    }, [contactEmails]);

    const contactGroupsMap = useMemo(() => toMap(contactGroups), [contactGroups]);

    const filteredContacts = useMemo(() => {
        if (!Array.isArray(contacts)) {
            return [];
        }
        return contacts.filter(({ Name, ID, LabelIDs }) => {
            const emails = contactEmailsMap[ID]
                ? (contactEmailsMap[ID] as ContactEmail[]).map(({ Email }) => Email).join(' ')
                : '';
            const searchFilter = normalizedSearch.length
                ? normalize(`${Name} ${emails}`).includes(normalizedSearch)
                : true;

            const groupFilter = contactGroupID ? LabelIDs.includes(contactGroupID) : true;

            return searchFilter && groupFilter;
        });
    }, [contacts, contactGroupID, normalizedSearch, contactEmailsMap]);

    const formattedContacts = useMemo<FormattedContact[]>(() => {
        return filteredContacts.map((contact) => {
            const { ID } = contact;
            return {
                ...contact,
                emails: (contactEmailsMap[ID] || []).map(({ Email }) => Email),
                isChecked: !!checkedContacts[ID],
            };
        });
    }, [filteredContacts, checkedContacts, contactEmailsMap]);

    const mergeableContacts = useMemo(() => extractMergeable(formattedContacts), [formattedContacts]);
    const canMerge = mergeableContacts.length > 0;

    const filteredCheckedIDs = useMemo(() => {
        return formattedContacts.filter(({ isChecked }) => isChecked).map(({ ID }) => ID);
    }, [formattedContacts, contactID]);

    const hasCheckedAllFiltered = useMemo(() => {
        const filteredContactsLength = filteredContacts.length;
        return !!filteredContactsLength && filteredCheckedIDs.length === filteredContactsLength;
    }, [filteredContacts, filteredCheckedIDs]);

    const activeIDs = useMemo(() => {
        return !filteredCheckedIDs.length && contactID ? [contactID] : filteredCheckedIDs;
    }, [filteredCheckedIDs, contactID]);

    const handleCheck = (contactIDs: string[] = [], checked = false) => {
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

    const onDelete = () => {
        const deleteAll = activeIDs.length === contacts.length;
        if (deleteAll) {
            history.replace({ ...location, state: { ignoreClose: true }, pathname: '/' });
            return setCheckedContacts(Object.create(null));
        }
        if (activeIDs.length === filteredContacts.length) {
            handleClearSearch();
        }
        if (contactID && activeIDs.includes(contactID)) {
            history.replace({ ...location, state: { ignoreClose: true }, pathname: '/' });
        }
        handleCheck(filteredCheckedIDs, false);
    };

    const handleDelete = () => {
        const deleteAll = activeIDs.length === contacts.length;
        createModal(<ContactDeleteModal contactIDs={activeIDs} deleteAll={deleteAll} onDelete={onDelete} />);
    };

    const handleMerge = (mergeAll = true) => {
        const contacts = mergeAll ? mergeableContacts : [formattedContacts.filter(({ isChecked }) => isChecked)];

        createModal(
            <MergeModal
                contacts={contacts}
                contactID={contactID}
                userKeysList={userKeysList}
                onMerged={() => setCheckedContacts(Object.create(null))} // Unselect all contacts
            />
        );
    };
    const handleImport = () => history.push('/settings/import#import');
    const handleExport = () => history.push('/settings/import#export');
    const handleGroups = () => history.push('/settings/groups');

    const showToolbar = !(isNarrow && contactID);
    const backUrl = showToolbar ? undefined : '/';

    const isLoading =
        loadingContactEmails ||
        loadingContacts ||
        loadingContactGroups ||
        loadingUserKeys ||
        loadingAddresses ||
        loadingUserSettings;
    const contactsLength = contacts ? contacts.length : 0;

    const contactComponent = contactID && !!contactsLength && !hasChecked && (
        <ErrorBoundary key={contactID} component={<GenericError className="pt2 view-column-detail flex-item-fluid" />}>
            <ContactContainer
                contactID={contactID}
                contactEmails={contactEmailsMap[contactID] || []}
                contactGroupsMap={contactGroupsMap}
                ownAddresses={ownAddresses}
                userKeysList={userKeysList}
                onDelete={onDelete}
            />
        </ErrorBoundary>
    );

    const contactsListComponent = (isDesktop || !contactComponent) && (
        <ContactsList
            contactID={contactID}
            contactGroupID={contactGroupID}
            totalContacts={contactsLength}
            totalContactsInGroup={totalContactsInGroup}
            contacts={formattedContacts}
            contactGroupsMap={contactGroupsMap}
            user={user}
            userSettings={userSettings}
            loadingUserKeys={loadingUserKeys}
            onCheck={handleCheck}
            onClearSearch={handleClearSearch}
            onClearSelection={handleUncheckAll}
            onImport={handleImport}
            isDesktop={isDesktop}
        />
    );

    const contactPlaceHolderComponent = isDesktop && !contactComponent && !!formattedContacts.length && (
        <ContactPlaceholder
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

    useAppTitle(title);

    const logo = <MainLogo to="/" />;
    const header = (
        <PrivateHeader
            logo={logo}
            settingsButton={<SettingsButton to="/settings" />}
            title={title}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            isNarrow={isNarrow}
            backUrl={backUrl}
            searchDropdown={
                <SearchDropdown
                    originalPlacement="bottom-right"
                    content={<Icon name="search" size={24} className="topnav-icon mr0-5 flex-item-centered-vert" />}
                    placeholder={c('Placeholder').t`Search contacts`}
                    search={search}
                    onSearch={updateSearch}
                    hasCaret={false}
                />
            }
            searchBox={
                <Searchbox placeholder={c('Placeholder').t`Search contacts`} value={search} onChange={updateSearch} />
            }
            floatingButton={
                <FloatingButton
                    onClick={() => createModal(<ContactModal history={history} onAdd={handleClearSearch} />)}
                    icon="plus"
                />
            }
        />
    );

    const sidebar = (
        <ContactsSidebar
            logo={logo}
            user={user}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            onClearSearch={handleClearSearch}
            totalContacts={contactsLength}
            contactGroups={contactGroups}
            contacts={contacts}
        />
    );

    return (
        <PrivateAppContainer header={header} sidebar={sidebar}>
            {showToolbar ? (
                <ContactToolbar
                    user={user}
                    contactEmailsMap={contactEmailsMap}
                    activeIDs={activeIDs}
                    checked={hasCheckedAllFiltered}
                    onCheck={handleCheckAllFiltered}
                    onDelete={handleDelete}
                    simplified={!!contactID && !isDesktop}
                    onMerge={() => handleMerge(false)}
                />
            ) : undefined}
            <PrivateMainArea hasToolbar className="flex">
                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        {contactsListComponent}
                        {contactComponent}
                        {contactPlaceHolderComponent}
                    </>
                )}
            </PrivateMainArea>
        </PrivateAppContainer>
    );
};

export default ContactsContainer;
