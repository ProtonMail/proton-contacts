import React, { useEffect, useRef } from 'react';
import { AppsSidebar, Sidebar, StorageSpaceStatus, Href, MainAreaContext, useUser } from 'react-components';
import { Route, Switch, Redirect } from 'react-router';
import { c } from 'ttag';

import PrivateHeader from '../content/PrivateHeader';
import GeneralPage from '../pages/GeneralPage';
import ContactGroupsPage from '../pages/ContactGroupsPage';

const SettingsContainer = () => {
    const mainAreaRef = useRef();
    const [{ hasPaidMail }] = useUser();

    useEffect(() => {
        mainAreaRef.current.scrollTop = 0;
    }, [location.pathname]);

    const list = [
        { link: '/contacts/settings/general', icon: 'general', text: c('Link').t`General` },
        hasPaidMail && { link: '/contacts/settings/groups', icon: 'contacts-groups', text: c('Link').t`Contact groups` }
    ].filter(Boolean);

    return (
        <div className="flex flex-nowrap no-scroll">
            <AppsSidebar
                items={[
                    <StorageSpaceStatus key="storage">
                        <Href url="/settings/subscription" className="pm-button pm-button--primary">
                            {c('Action').t`Upgrade`}
                        </Href>
                    </StorageSpaceStatus>
                ]}
            />
            <div className="content flex-item-fluid reset4print">
                <PrivateHeader />
                <div className="flex flex-nowrap">
                    <Sidebar list={list} />
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
            </div>
        </div>
    );
};

export default SettingsContainer;
