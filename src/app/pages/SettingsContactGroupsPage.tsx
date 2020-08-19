import React from 'react';
import { c } from 'ttag';
import { SettingsPropsShared } from 'react-components';
import { PERMISSIONS } from 'proton-shared/lib/constants';

import ContactGroupsSection from '../components/ContactGroupsSection';
import PrivateMainSettingsAreaWithPermissions from '../components/PrivateMainSettingsAreaWithPermissions';

const { PAID_MAIL } = PERMISSIONS;

export const getContactGroupsPage = () => {
    return {
        to: '/settings/groups',
        icon: 'contacts-groups',
        text: c('Title').t`Contact groups`,
        permissions: [PAID_MAIL],
        subsections: [
            {
                text: c('Title').t`Contact groups`,
                id: 'contacts'
            }
        ]
    };
};

const SettingsContactGroupsPage = ({ setActiveSection, location }: SettingsPropsShared) => {
    return (
        <PrivateMainSettingsAreaWithPermissions
            config={getContactGroupsPage()}
            location={location}
            setActiveSection={setActiveSection}
        >
            <ContactGroupsSection />
        </PrivateMainSettingsAreaWithPermissions>
    );
};

export default SettingsContactGroupsPage;
