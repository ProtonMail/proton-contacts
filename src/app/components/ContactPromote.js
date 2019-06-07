import React from 'react';
import { c } from 'ttag';
import { Alert, Icon } from 'react-components';

const ContactPromote = () => {
    return (
        <>
            <h3 className="mb1">
                <Icon name="lock" /> {c('Title').t`Encrypted details`}
            </h3>
            <Alert learnMore="TODO">{c('Info')
                .t`Upgrade your plan to unlock encrypted details such as phone numbers and home addresses.`}</Alert>
            <a href="/settings/dashboard" className="pm-button pm-button pm-button--primary">{c('Action')
                .t`Upgrade`}</a>
        </>
    );
};

export default ContactPromote;
