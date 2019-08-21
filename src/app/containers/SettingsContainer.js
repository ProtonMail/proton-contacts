import React from 'react';
import { AppsSidebar, Sidebar, StorageSpaceStatus, Href } from 'react-components';
import { Route, Switch } from 'react-router';
import { c } from 'ttag';

import PrivateHeader from '../content/PrivateHeader';
import SettingsPage from '../pages/SettingsPage';

const SettingsContainer = () => {
    const list = [{ link: '/contacts/settings', icon: 'contacts', text: c('Link').t`General` }];
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
                    <div className="main flex-item-fluid main-area">
                        <Switch>
                            <Route path="/contacts/settings" component={SettingsPage} />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsContainer;
