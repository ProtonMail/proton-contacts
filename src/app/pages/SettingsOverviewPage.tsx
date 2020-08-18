import React from 'react';
import { c } from 'ttag';
import { PrivateMainArea, OverviewLayout, useUser } from 'react-components';
import isTruthy from 'proton-shared/lib/helpers/isTruthy';

import { getGeneralSettingsPage } from './SettingsGeneralPage';
import { getContactGroupsPage } from './SettingsContactGroupsPage';

export const getOverviewPage = () => {
    return {
        to: '/contacts/settings/overview',
        icon: 'apps',
        text: c('Link').t`Overview`
    };
};

const SettingsOverviewPage = () => {
    const [{ hasPaidMail }] = useUser();
    const pages = [getGeneralSettingsPage(), hasPaidMail && getContactGroupsPage()].filter(isTruthy);
    return (
        <PrivateMainArea className="flex">
            <OverviewLayout pages={pages} title={c('Title').t`Contact settings`} />
        </PrivateMainArea>
    );
};

export default SettingsOverviewPage;
