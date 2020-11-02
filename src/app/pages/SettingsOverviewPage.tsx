import React from 'react';
import { c } from 'ttag';
import { PrivateMainArea, OverviewLayout } from 'react-components';

import { getGeneralSettingsPage } from './SettingsGeneralPage';
import { getContactGroupsPage } from './SettingsContactGroupsPage';
import { getImportExportPage } from './SettingsImportExportPage';

export const getOverviewPage = () => {
    return {
        to: '/settings/overview',
        icon: 'apps',
        text: c('Link').t`Overview`,
    };
};

const SettingsOverviewPage = () => {
    const pages = [getGeneralSettingsPage(), getContactGroupsPage(), getImportExportPage()];
    return (
        <PrivateMainArea className="flex">
            <OverviewLayout pages={pages} title={c('Title').t`Contact settings`} />
        </PrivateMainArea>
    );
};

export default SettingsOverviewPage;
