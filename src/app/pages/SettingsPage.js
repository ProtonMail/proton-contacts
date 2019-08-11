import React from 'react';
import { useUser } from 'react';

import ContactsSection from '../components/ContactsSection';
import ContactGroupsSection from '../components/ContactGroupsSection';

const SettingsPage = () => {
    const [{ hasPaidMail }] = useUser();
    
    return (
        <main className="main-area-content bg-white relative flex-item-fluid p2">
            <ContactsSection />
            {hasPaidMail ? <ContactGroupsSection /> : null}
        </main>
    );
};

export default SettingsPage;
