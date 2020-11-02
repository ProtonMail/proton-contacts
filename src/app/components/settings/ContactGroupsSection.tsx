import React from 'react';
import { c } from 'ttag';
import { PrimaryButton, Alert, useModals, ContactGroupModal } from 'react-components';

import ContactGroupsTable from '../ContactGroupsTable';

const ContactGroupsSection = () => {
    const { createModal } = useModals();
    const handleCreate = () => createModal(<ContactGroupModal selectedContactEmails={[]} />);
    return (
        <>
            <Alert>{c('Info')
                .t`A group can contain multiple email addresses from the same contact. Please note that a sending limit may apply and prevent you from sending emails to excessively large groups.`}</Alert>
            <div className="mb1">
                <PrimaryButton onClick={handleCreate}>{c('Action').t`Add group`}</PrimaryButton>
            </div>
            <ContactGroupsTable />
        </>
    );
};

export default ContactGroupsSection;
