import React from 'react';
import { c } from 'ttag';
import { SettingsPropsShared, PrivateMainSettingsArea, EarlyAccessSection } from 'react-components';

import ContactsSection from '../components/settings/ContactsSection';

export const getGeneralSettingsPage = () => {
    return {
        to: '/settings/general',
        icon: 'settings-singular',
        text: c('Link').t`General`,
        subsections: [
            {
                text: c('Title').t`Contacts`,
                id: 'contacts',
            },
            {
                text: c('Title').t`Early Access`,
                id: 'early-access',
            },
        ],
    };
};

const SettingsGeneralPage = ({ setActiveSection, location }: SettingsPropsShared) => {
    const { text, subsections } = getGeneralSettingsPage();
    return (
        <PrivateMainSettingsArea
            title={text}
            location={location}
            setActiveSection={setActiveSection}
            subsections={subsections}
        >
            <ContactsSection />
            <EarlyAccessSection />
        </PrivateMainSettingsArea>
    );
};

export default SettingsGeneralPage;
