import React from 'react';
import { c } from 'ttag';
import {
    useActiveBreakpoint,
    PrivateHeader,
    PrivateMainArea,
    PrivateAppContainer,
    useAppTitle,
    Searchbox,
    SettingsButton,
    MainLogo
} from 'react-components';

import ContactToolbar from '../components/ContactToolbar';
import ContactsSidebar from '../content/ContactsSidebar';
import { noop } from 'proton-shared/lib/helpers/function';

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
            settingsButton={<SettingsButton to="/settings" />}
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
            history={history}
            user={user}
            expanded={expanded}
            onToggleExpand={noop}
            onClearSearch={noop}
            totalContacts={0}
            contactGroups={[]}
            contacts={[]}
        />
    );

    return (
        <PrivateAppContainer header={header} sidebar={sidebar} isBlurred>
            <ContactToolbar
                user={user}
                contactEmailsMap={{}}
                activeIDs={[]}
                checked={false}
                onCheck={noop}
                onDelete={noop}
                simplified={!isDesktop}
                onMerge={noop}
                userKeysList={[]}
            />
            <PrivateMainArea hasToolbar className="flex" />
        </PrivateAppContainer>
    );
};

export default ContactsContainerBlurred;
