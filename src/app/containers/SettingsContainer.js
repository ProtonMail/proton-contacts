import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Sidebar,
    useUser,
    useToggle,
    useActiveBreakpoint,
    getSectionConfigProps,
    PrivateAppContainer
} from 'react-components';
import { Route, Switch, Redirect } from 'react-router';
import { c } from 'ttag';

import PrivateHeader from '../content/PrivateHeader';
import GeneralPage, { getGeneralSettingsPage } from '../pages/SettingsGeneralPage';
import SettingsContactGroupsPage, { getContactGroupsPage } from '../pages/SettingsContactGroupsPage';
import SidebarVersion from '../content/SidebarVersion';

const SettingsContainer = ({ location }) => {
    const [{ hasPaidMail }] = useUser();
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { isNarrow } = useActiveBreakpoint();
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        setExpand(false);
    }, [location.pathname]);

    const list = getSectionConfigProps(
        [getGeneralSettingsPage(), hasPaidMail && getContactGroupsPage()].filter(Boolean),
        window.location.pathname,
        activeSection
    );

    const header = (
        <PrivateHeader
            inSettings={true}
            title={c('Title').t`Settings`}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            isNarrow={isNarrow}
        />
    );

    const sidebar = (
        <Sidebar
            url="/contacts"
            list={list}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            version={<SidebarVersion />}
        />
    );

    return (
        <PrivateAppContainer header={header} sidebar={sidebar}>
            <Switch>
                <Route
                    path="/contacts/settings/general"
                    render={({ location }) => {
                        return <GeneralPage location={location} setActiveSection={setActiveSection} />;
                    }}
                />
                <Route
                    path="/contacts/settings/groups"
                    render={({ location }) => {
                        return <SettingsContactGroupsPage location={location} setActiveSection={setActiveSection} />;
                    }}
                />
                <Redirect to="/contacts/settings/general" />
            </Switch>
        </PrivateAppContainer>
    );
};

SettingsContainer.propTypes = {
    location: PropTypes.object.isRequired
};

export default SettingsContainer;
