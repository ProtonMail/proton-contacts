import React from 'react';
import { c } from 'ttag';
import {
    useActiveBreakpoint,
    PrivateHeader,
    PrivateMainArea,
    PrivateAppContainer,
    useAppTitle,
    Searchbox,
    TopNavbarListItemSettingsButton,
    MainLogo,
} from 'react-components';
import { UserModel } from 'proton-shared/lib/interfaces';
import { noop } from 'proton-shared/lib/helpers/function';
import ContactToolbar from '../components/ContactToolbar';
import ContactsSidebar from '../content/ContactsSidebar';

const ContactsContainerBlurred = () => {
    const { isDesktop, isNarrow } = useActiveBreakpoint();
    const search = '';
    const expanded = false;
    const user = {};

    const title = search === '' ? c('Title').t`Contacts` : c('Title').t`Search`;

    useAppTitle(title);

    const logo = <MainLogo to="/" />;
    const header = (
        <PrivateHeader
            logo={logo}
            settingsButton={<TopNavbarListItemSettingsButton to="/settings" />}
            title={title}
            expanded={false}
            onToggleExpand={noop}
            isNarrow={isNarrow}
            searchBox={<Searchbox placeholder={c('Placeholder').t`Search contacts`} value={search} onChange={noop} />}
        />
    );

    const sidebar = (
        <ContactsSidebar
            logo={logo}
            user={user as UserModel}
            expanded={expanded}
            onToggleExpand={noop}
            onClearSearch={noop}
            totalContacts={0}
            contactGroups={[]}
            contacts={[]}
            contactEmailsMap={{}}
        />
    );

    return (
        <PrivateAppContainer header={header} sidebar={sidebar} isBlurred>
            <ContactToolbar
                user={user as UserModel}
                contactEmailsMap={{}}
                activeIDs={[]}
                checked={false}
                onDelete={noop}
                simplified={!isDesktop}
                onMerge={noop}
                onCheckAll={noop}
            />
            <PrivateMainArea hasToolbar className="flex" />
        </PrivateAppContainer>
    );
};

export default ContactsContainerBlurred;
