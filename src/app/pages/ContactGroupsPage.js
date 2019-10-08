import React from 'react';
import { c } from 'ttag';

import ContactGroupsSection from '../components/ContactGroupsSection';
import SettingsPage from './SettingsPage';

const ContactGroupsPage = () => {
    return (
        <SettingsPage title={c('Title').t`Contact groups`}>
            <ContactGroupsSection />
        </SettingsPage>
    );
};

export default ContactGroupsPage;
