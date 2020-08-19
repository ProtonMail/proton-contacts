import React, { useEffect, useState } from 'react';
import {
    Sidebar,
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

import OverviewPage, { getOverviewPage } from '../pages/SettingsOverviewPage';
import GeneralPage, { getGeneralSettingsPage } from '../pages/SettingsGeneralPage';
import SettingsContactGroupsPage, { getContactGroupsPage } from '../pages/SettingsContactGroupsPage';
import SidebarVersion from '../content/SidebarVersion';

interface Props {
    location: H.Location;
}
const SettingsContainer = ({ location }: Props) => {
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { isNarrow } = useActiveBreakpoint();
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        setExpand(false);
    }, [location.pathname, location.hash]);

    const logo = <MainLogo to="/" />;
    const pages = [getOverviewPage(), getGeneralSettingsPage(), getContactGroupsPage()];

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
                        list={pages}
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
                    path="/settings/overview"
                    render={() => {
                        return <OverviewPage />;
                    }}
                />
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
                <Redirect to="/settings/overview" />
            </Switch>
        </PrivateAppContainer>
    );
};

export default SettingsContainer;
