import React from 'react';
import { c } from 'ttag';

import SettingsPage from './SettingsPage';
import ContactsSection from '../components/ContactsSection';

const GeneralPage = () => {
    return (
        <SettingsPage title={c('Title').t`General`}>
            <ContactsSection />
        </SettingsPage>
    );
};

export default GeneralPage;
