import React, { useEffect, useState } from 'react';
import {
    Sidebar,
    useUser,
    useToggle,
    useActiveBreakpoint,
    PrivateAppContainer,
    SidebarListItemsWithSubsections,
    SidebarList,
    SidebarNav,
    SidebarBackButton,
    PrivateHeader,
    MainLogo
} from 'react-components';
import { Route, Switch, Redirect } from 'react-router';
import { c } from 'ttag';
import * as H from 'history';
import isTruthy from 'proton-shared/lib/helpers/isTruthy';

import GeneralPage, { getGeneralSettingsPage } from '../pages/SettingsGeneralPage';
import SettingsContactGroupsPage, { getContactGroupsPage } from '../pages/SettingsContactGroupsPage';
import SidebarVersion from '../content/SidebarVersion';

interface Props {
    location: H.Location;
}
const SettingsContainer = ({ location }: Props) => {
    const [{ hasPaidMail }] = useUser();
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { isNarrow } = useActiveBreakpoint();
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        setExpand(false);
    }, [location.pathname, location.hash]);

    const logo = <MainLogo to="/" />;

    const header = (
        <PrivateHeader
            logo={logo}
            title={c('Title').t`Settings`}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            isNarrow={isNarrow}
        />
    );

    const sidebar = (
        <Sidebar
            logo={logo}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            primary={<SidebarBackButton to="/">{c('Action').t`Back to Contacts`}</SidebarBackButton>}
            version={<SidebarVersion />}
        >
            <SidebarNav>
                <SidebarList>
                    <SidebarListItemsWithSubsections
                        list={[getGeneralSettingsPage(), hasPaidMail && getContactGroupsPage()].filter(isTruthy)}
                        pathname={location.pathname}
                        activeSection={activeSection}
                    />
                </SidebarList>
            </SidebarNav>
        </Sidebar>
    );

    return (
        <PrivateAppContainer header={header} sidebar={sidebar}>
            <Switch>
                <Route
                    path="/settings/general"
                    render={({ location }) => {
                        return <GeneralPage location={location} setActiveSection={setActiveSection} />;
                    }}
                />
                <Route
                    path="/settings/groups"
                    render={({ location }) => {
                        return <SettingsContactGroupsPage location={location} setActiveSection={setActiveSection} />;
                    }}
                />
                <Redirect to="/settings/general" />
            </Switch>
        </PrivateAppContainer>
    );
};

export default SettingsContainer;
