import React from 'react';
import { c } from 'ttag';
import { getAppName } from 'proton-shared/lib/apps/helper';
import { OnboardingContent, OnboardingModal, OnboardingStep, OnboardingStepRenderCallback } from 'react-components';
import { APPS } from 'proton-shared/lib/constants';
import { getLightOrDark } from 'proton-shared/lib/themes/helpers';

import onboardingWelcome from 'design-system/assets/img/onboarding/onboarding-protoncontacts.svg';
import onboardingWelcomeDark from 'design-system/assets/img/onboarding/onboarding-protoncontacts-dark.svg';

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
                        img={<img src={getLightOrDark(onboardingWelcome, onboardingWelcomeDark)} alt={appName} />}
                        text={c('Onboarding ProtonContacts')
                            .t`Even the people you interact with benefit from Proton privacy. Apart from their email address and display name, all other contact details are protected with end-to-end encryption.`}
                    />
                </OnboardingStep>
            )}
        </OnboardingModal>
    );
};

export default ContactsOnboardingModal;
