import React from 'react';
import { c } from 'ttag';
import { Alert, Icon, Href } from 'react-components';

const ContactPromote = () => {
    return (
        <div className="contactPromote-container">
            <h3 className="mb1">
                <Icon name="lock" /> {c('Title').t`Encrypted details`}
            </h3>
            <Alert learnMore="https://protonmail.com/support/knowledge-base/encrypted-contacts/">{c('Info')
                .t`Upgrade your plan to unlock encrypted details such as phone numbers and home addresses.`}</Alert>
            <div className="mb1">
                <Href url="/settings/subscription" target="_self" className="pm-button pm-button pm-button--primary">{c(
                    'Action'
                ).t`Upgrade`}</Href>
            </div>
        </div>
    );
};

export default ContactPromote;
