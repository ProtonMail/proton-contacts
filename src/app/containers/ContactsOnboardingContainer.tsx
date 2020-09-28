import React, { useEffect } from 'react';
import { useModals } from 'react-components';

import ContactsOnboardingModal from '../components/onboarding/ContactsOnboardingModal';
import ContactsContainerBlurred from './ContactsContainerBlurred';

interface Props {
    onDone: () => void;
}
const ContactsOnboardingContainer = ({ onDone }: Props) => {
    const { createModal } = useModals();

    useEffect(() => {
        createModal(<ContactsOnboardingModal onClose={onDone} />);
    }, []);

    return <ContactsContainerBlurred />;
};

export default ContactsOnboardingContainer;
