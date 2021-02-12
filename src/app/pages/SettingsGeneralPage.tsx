import React from 'react';
import { c } from 'ttag';
import { SettingsPropsShared, PrivateMainSettingsArea, EarlyAccessSection, useEarlyAccess } from 'react-components';
import isTruthy from 'proton-shared/lib/helpers/isTruthy';

import ContactsSection from '../components/settings/ContactsSection';

export const getGeneralSettingsPage = ({ hasEarlyAccess }: { hasEarlyAccess: boolean }) => {
    return {
        to: '/settings/general',
        icon: 'settings-singular',
        text: c('Link').t`General`,
        subsections: [
            {
                text: c('Title').t`Contacts`,
                id: 'contacts',
            },
            hasEarlyAccess
                ? {
                      text: c('Title').t`Early Access`,
                      id: 'early-access',
                  }
                : undefined,
        ].filter(isTruthy),
    };
};

const SettingsGeneralPage = ({ setActiveSection, location }: SettingsPropsShared) => {
    const { hasEarlyAccess } = useEarlyAccess();
    const { text, subsections } = getGeneralSettingsPage({ hasEarlyAccess });
    return (
        <PrivateMainSettingsArea
            title={text}
            location={location}
            setActiveSection={setActiveSection}
            subsections={subsections}
        >
            <ContactsSection />
            {hasEarlyAccess ? <EarlyAccessSection /> : null}
        </PrivateMainSettingsArea>
    );
};

export default SettingsGeneralPage;
