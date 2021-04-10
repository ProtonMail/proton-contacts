import React from 'react';
import { c } from 'ttag';
import { getAppName } from 'proton-shared/lib/apps/helper';
import { OnboardingContent, OnboardingModal, OnboardingStep, OnboardingStepRenderCallback } from 'react-components';
import { APPS } from 'proton-shared/lib/constants';

import onboardingWelcome from 'design-system/assets/img/onboarding/contacts-welcome.svg';

const ContactsOnboardingModal = (props: any) => {
    const appName = getAppName(APPS.PROTONCONTACTS);
    return (
        <OnboardingModal {...props}>
            {({ onClose }: OnboardingStepRenderCallback) => (
                <OnboardingStep
                    title={c('Onboarding ProtonContacts').t`Your contacts are safe with Proton`}
                    submit={c('Onboarding ProtonContacts').t`Start using ${appName}`}
                    onSubmit={onClose}
                    close={null}
                >
                    <OnboardingContent
                        description={c('Onboarding ProtonContacts')
                            .t`Even the people you interact with benefit from Proton privacy. Apart from their email address and display name, all other contact details are protected with end-to-end encryption.`}
                        img={<img src={onboardingWelcome} alt={appName} />}
                    />
                </OnboardingStep>
            )}
        </OnboardingModal>
    );
};

export default ContactsOnboardingModal;
