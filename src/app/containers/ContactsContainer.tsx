import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { c } from 'ttag';

import {
    Loader,
    useUser,
    useUserKeys,
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
    TopNavbarListItemSettingsButton,
    MainLogo,
    ContactGroupModal,
    useFeature,
    FeatureCode,
    useAppLink,
} from 'react-components';

import { APPS } from 'proton-shared/lib/constants';
import { extractMergeable } from 'proton-shared/lib/contacts/helpers/merge';
import { noop } from 'proton-shared/lib/helpers/function';
import ContactsList from 'react-components/containers/contacts/ContactsList';
import useContactList from 'react-components/containers/contacts/useContactList';

import ContactPlaceholder from '../components/ContactPlaceholder';
import ContactToolbar from '../components/ContactToolbar';
import ContactsSidebar from '../content/ContactsSidebar';
import MergeModal from '../components/merge/MergeModal';
import EmptyPlaceholder, { EmptyType } from '../components/EmptyPlaceholder';

const ContactsContainer = () => {
    const appLink = useAppLink();
    const history = useHistory();
    const location = useLocation();
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { createModal } = useModals();
    const { isDesktop, isNarrow } = useActiveBreakpoint();
    const [search, updateSearch] = useState('');
    const [user] = useUser();
    const [userSettings, loadingUserSettings] = useUserSettings();
    const [userKeysList, loadingUserKeys] = useUserKeys();
    const [addresses = [], loadingAddresses] = useAddresses();
    const { feature: featureUsedContactsImport } = useFeature(FeatureCode.UsedContactsImport);

    const contactID = useMemo(() => {
        const [, contactID] = location.pathname.split('/');
        return contactID;
    }, [location]);

    const contactGroupID = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('contactGroupID') || undefined;
    }, [location.search]);

    const ownAddresses = useMemo(() => addresses.map(({ Email }) => Email), [addresses]);

    useEffect(() => {
        setExpand(false);
        // clean also the search
        updateSearch('');
    }, [contactGroupID]);

    const handleClearSearch = () => {
        updateSearch('');
    };

    const {
        loading: loadingContacts,
        formattedContacts,
        filteredContacts,
        checkedIDs,
        selectedIDs,
        contacts,
        contactGroups,
        handleCheckAll,
        contactEmailsMap,
        contactGroupsMap,
        contactGroupName,
        totalContactsInGroup,
        handleCheck,
        handleCheckOne,
        hasCheckedAllFiltered,
    } = useContactList({
        search,
        contactID,
        contactGroupID,
    });

    const mergeableContacts = useMemo(() => extractMergeable(formattedContacts), [formattedContacts]);
    const canMerge = mergeableContacts.length > 0;

    const handleClick = (ID: string) => {
        handleCheckAll(false);
        history.push({ ...history.location, pathname: `/${ID}` });
    };

    const onDelete = () => {
        const deleteAll = selectedIDs.length === contacts.length;
        if (deleteAll) {
            history.replace({ ...location, state: { ignoreClose: true }, pathname: '/' });
            handleCheckAll(false);
        }
        if (selectedIDs.length === filteredContacts.length) {
            handleClearSearch();
        }
        if (contactID && selectedIDs.includes(contactID)) {
            history.replace({ ...location, state: { ignoreClose: true }, pathname: '/' });
        }
        handleCheckAll(false);
    };

    const handleDelete = () => {
        const deleteAll = selectedIDs.length === contacts.length;
        createModal(<ContactDeleteModal contactIDs={selectedIDs} deleteAll={deleteAll} onDelete={onDelete} />);
    };

    const handleMerge = (mergeAll = true) => {
        const selectedContacts = formattedContacts.filter((contact) => selectedIDs.includes(contact.ID));
        const contacts = mergeAll ? mergeableContacts : [selectedContacts];

        createModal(
            <MergeModal
                contacts={contacts}
                contactID={contactID}
                userKeysList={userKeysList}
                onMerged={() => handleCheckAll(false)} // Unselect all contacts
            />
        );
    };
    const handleImport = () => appLink('/contacts/import-export#import', APPS.PROTONACCOUNT);

    const handleAddContact = () => {
        createModal(<ContactModal onAdd={() => updateSearch('')} />);
    };
    const handleEditGroup = (contactGroupID: string) => {
        createModal(<ContactGroupModal contactGroupID={contactGroupID} selectedContactEmails={[]} />);
    };

    const showToolbar = !(isNarrow && contactID);
    const backUrl = showToolbar ? undefined : '/';

    const isLoading = loadingContacts || loadingUserKeys || loadingAddresses || loadingUserSettings;
    const contactsLength = contacts ? contacts.length : 0;

    const showEmptyPlaceholder = !isLoading && !formattedContacts.length;
    const showContact = !isLoading && contactID && !!contactsLength && !checkedIDs.length;
    const showList = !isLoading && (isDesktop || !showContact);
    const showContactPlaceholder = !isLoading && isDesktop && !showContact && !!formattedContacts.length;

    let emptyType: EmptyType | undefined;

    if (showEmptyPlaceholder) {
        if (!contactsLength) {
            emptyType = EmptyType.All;
        } else if (contactGroupID) {
            emptyType = EmptyType.Group;
        } else if (search) {
            emptyType = EmptyType.Search;
        }
    }

    const title = search === '' ? c('Title').t`Contacts` : c('Title').t`Search`;

    useAppTitle(title);

    const logo = <MainLogo to="/" />;
    const header = (
        <PrivateHeader
            logo={logo}
            settingsButton={<TopNavbarListItemSettingsButton to="/contacts/general" toApp={APPS.PROTONACCOUNT} />}
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
                <Searchbox
                    placeholder={c('Placeholder').t`Search contacts`}
                    value={search}
                    onChange={updateSearch}
                    onFocus={noop}
                />
            }
            floatingButton={
                <FloatingButton onClick={() => createModal(<ContactModal onAdd={handleClearSearch} />)}>
                    <Icon size={24} name="plus" className="mauto" />
                </FloatingButton>
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
            contactEmailsMap={contactEmailsMap}
        />
    );

    return (
        <PrivateAppContainer header={header} sidebar={sidebar}>
            {showToolbar ? (
                <ContactToolbar
                    user={user}
                    contactEmailsMap={contactEmailsMap}
                    activeIDs={selectedIDs}
                    checked={hasCheckedAllFiltered}
                    onCheckAll={handleCheckAll}
                    onDelete={handleDelete}
                    simplified={!!contactID && !isDesktop}
                    onMerge={() => handleMerge(false)}
                />
            ) : undefined}
            <PrivateMainArea hasToolbar className="flex">
                {isLoading ? <Loader /> : null}
                {showEmptyPlaceholder ? (
                    <EmptyPlaceholder
                        type={emptyType}
                        onEditGroup={() => handleEditGroup(contactGroupID as string)}
                        onClearSearch={() => updateSearch('')}
                        onCreate={handleAddContact}
                        onImport={handleImport}
                    />
                ) : null}
                {showList ? (
                    <ContactsList
                        contactID={contactID}
                        totalContacts={contactsLength}
                        contacts={formattedContacts}
                        contactGroupsMap={contactGroupsMap}
                        user={user}
                        userSettings={userSettings}
                        onCheckOne={handleCheckOne}
                        isDesktop={isDesktop}
                        checkedIDs={checkedIDs}
                        onCheck={handleCheck}
                        onClick={handleClick}
                    />
                ) : null}
                {showContact ? (
                    <ErrorBoundary
                        key={contactID}
                        component={<GenericError className="pt2 view-column-detail flex-item-fluid" />}
                    >
                        <ContactContainer
                            contactID={contactID}
                            contactEmails={contactEmailsMap[contactID] || []}
                            contactGroupsMap={contactGroupsMap}
                            ownAddresses={ownAddresses}
                            userKeysList={userKeysList}
                            onDelete={onDelete}
                        />
                    </ErrorBoundary>
                ) : null}
                {showContactPlaceholder ? (
                    <ContactPlaceholder
                        user={user}
                        userKeysList={userKeysList}
                        loadingUserKeys={loadingUserKeys}
                        totalContacts={contactsLength}
                        totalContactsInGroup={totalContactsInGroup}
                        selectedContacts={checkedIDs.length}
                        contactGroupID={contactGroupID}
                        contactGroupName={contactGroupName}
                        onUncheck={() => handleCheckAll(false)}
                        canMerge={canMerge}
                        canImport={!!featureUsedContactsImport?.Value}
                        onMerge={handleMerge}
                        onImport={handleImport}
                    />
                ) : null}
            </PrivateMainArea>
        </PrivateAppContainer>
    );
};

export default ContactsContainer;
