import React from 'react';

import ContactsSection from '../components/ContactsSection';
import ContactGroupsSection from '../components/ContactGroupsSection';

const SettingsPage = () => {
    return (
        <main className="main-area-content bg-white relative flex-item-fluid p2">
            <ContactsSection />
            <ContactGroupsSection />
        </main>
    );
};

export default SettingsPage;
