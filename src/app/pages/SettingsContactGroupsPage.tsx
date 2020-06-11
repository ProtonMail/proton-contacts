import React from 'react';
import { c } from 'ttag';
import { SettingsPropsShared, PrivateMainSettingsArea } from 'react-components';

import ContactGroupsSection from '../components/ContactGroupsSection';

export const getContactGroupsPage = () => {
    return {
        link: '/contacts/settings/groups',
        icon: 'contacts-groups',
        text: c('Title').t`Contact groups`,
        subsections: [
            {
                text: c('Title').t`Contact groups`,
                id: 'contacts'
            }
        ]
    };
};

const SettingsContactGroupsPage = ({ setActiveSection, location }: SettingsPropsShared) => {
    const { text, subsections } = getContactGroupsPage();
    return (
        <PrivateMainSettingsArea
            title={text}
            location={location}
            appName="ProtonContacts"
            setActiveSection={setActiveSection}
            subsections={subsections}
        >
            <ContactGroupsSection />
        </PrivateMainSettingsArea>
    );
};

export default SettingsContactGroupsPage;
