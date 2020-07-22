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
    PrivateHeader
} from 'react-components';
import { Route, Switch, Redirect } from 'react-router';
import { c } from 'ttag';
import * as H from 'history';
import isTruthy from 'proton-shared/lib/helpers/isTruthy';

import GeneralPage, { getGeneralSettingsPage } from '../pages/SettingsGeneralPage';
import SettingsContactGroupsPage, { getContactGroupsPage } from '../pages/SettingsContactGroupsPage';
import SidebarVersion from '../content/SidebarVersion';

interface Props {
    history: H.History;
    location: H.Location;
}
const SettingsContainer = ({ location, history }: Props) => {
    const [{ hasPaidMail }] = useUser();
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { isNarrow } = useActiveBreakpoint();
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        setExpand(false);
    }, [location.pathname, location.hash]);

    const base = '/contacts';
    const goBack = () => history.push(base);

    const header = (
        <PrivateHeader
            url={base}
            title={c('Title').t`Settings`}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            isNarrow={isNarrow}
        />
    );

    const sidebar = (
        <Sidebar
            url={base}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            primary={<SidebarBackButton onClick={goBack}>{c('Action').t`Back to Contacts`}</SidebarBackButton>}
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
                    path={`${base}/settings/general`}
                    render={({ location }) => {
                        return <GeneralPage location={location} setActiveSection={setActiveSection} />;
                    }}
                />
                <Route
                    path={`${base}/settings/groups`}
                    render={({ location }) => {
                        return <SettingsContactGroupsPage location={location} setActiveSection={setActiveSection} />;
                    }}
                />
                <Redirect to={`${base}/settings/general`} />
            </Switch>
        </PrivateAppContainer>
    );
};

export default SettingsContainer;
