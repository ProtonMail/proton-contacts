import React from 'react';
import { c } from 'ttag';
import { SettingsPropsShared, PrivateMainSettingsArea } from 'react-components';

import ContactsSection from '../components/ContactsSection';

export const getGeneralSettingsPage = () => {
    return {
        to: '/contacts/settings/general',
        icon: 'settings-singular',
        text: c('Link').t`General`,
        subsections: [
            {
                text: c('Title').t`Contacts`,
                id: 'contacts'
            }
        ]
    };
};

const SettingsGeneralPage = ({ setActiveSection, location }: SettingsPropsShared) => {
    const { text, subsections } = getGeneralSettingsPage();
    return (
        <PrivateMainSettingsArea
            title={text}
            location={location}
            appName="ProtonContacts"
            setActiveSection={setActiveSection}
            subsections={subsections}
        >
            <ContactsSection />
        </PrivateMainSettingsArea>
    );
};

export default SettingsGeneralPage;
