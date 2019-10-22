import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Sidebar, MainAreaContext, useUser, useToggle } from 'react-components';
import { Route, Switch, Redirect } from 'react-router';
import { c } from 'ttag';

import PrivateHeader from '../content/PrivateHeader';
import GeneralPage from '../pages/GeneralPage';
import ContactGroupsPage from '../pages/ContactGroupsPage';
import PrivateLayout from '../content/PrivateLayout';

const SettingsContainer = ({ location }) => {
    const mainAreaRef = useRef();
    const [{ hasPaidMail }] = useUser();
    const { state: expanded, toggle: onToggleExpand } = useToggle();

    useEffect(() => {
        mainAreaRef.current.scrollTop = 0;
    }, [location.pathname]);

    const list = [
        { link: '/contacts/settings/general', icon: 'settings-singular', text: c('Link').t`General` },
        hasPaidMail && { link: '/contacts/settings/groups', icon: 'contacts-groups', text: c('Link').t`Contact groups` }
    ].filter(Boolean);

    const mobileLinks = [
        { to: '/inbox', icon: 'protonmail', external: true, current: false },
        { to: '/contacts', icon: 'protoncontacts', external: false, current: true }
    ];

    return (
        <PrivateLayout>
            <PrivateHeader expanded={expanded} onToggleExpand={onToggleExpand} />
            <div className="flex flex-nowrap">
                <Sidebar
                    url="/contacts"
                    list={list}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                    mobileLinks={mobileLinks}
                />
                <div className="main flex-item-fluid main-area" ref={mainAreaRef}>
                    <div className="flex flex-reverse">
                        <MainAreaContext.Provider value={mainAreaRef}>
                            <Switch>
                                <Route path="/contacts/settings/general" component={GeneralPage} />
                                <Route path="/contacts/settings/groups" component={ContactGroupsPage} />
                                <Redirect to="/contacts/settings/general" />
                            </Switch>
                        </MainAreaContext.Provider>
                    </div>
                </div>
            </div>
        </PrivateLayout>
    );
};

SettingsContainer.propTypes = {
    location: PropTypes.object.isRequired
};

export default SettingsContainer;
