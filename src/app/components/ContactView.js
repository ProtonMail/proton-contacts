import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { useModals, useUser, PrimaryButton, Button, Alert, Icon } from 'react-components';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';

import ContactModal from './ContactModal';
import { toICAL } from '../helpers/vcard';
import ContactSummary from './ContactSummary';
import ContactViewProperties from './ContactViewProperties';

const ContactView = ({ properties, contactID, errors }) => {
    const { createModal } = useModals();
    const [{ hasPaidMail }] = useUser();

    const openContactModal = () => {
        createModal(<ContactModal properties={properties} contactID={contactID} />);
    };

    const handleExport = () => {
        const filename = properties
            .filter(({ field }) => ['fn', 'email'].includes(field))
            .map(({ value }) => (Array.isArray(value) ? value[0] : value))[0];
        const vcard = toICAL(properties);
        const blob = new Blob([vcard.toString()], { type: 'data:text/plain;charset=utf-8;' });

        downloadFile(blob, filename);
    };

    return (
        <div className="view-column-detail flex-item-fluid scroll-if-needed">
            <div className="flex flex-spacebetween flex-items-center border-bottom">
                <div className="p1">
                    <h2 className="m0">{c('Title').t`Contact details`}</h2>
                </div>
                <div className="p1">
                    <PrimaryButton onClick={openContactModal} className="mr1">{c('Action').t`Edit`}</PrimaryButton>
                    <Button onClick={handleExport}>{c('Action').t`Export`}</Button>
                </div>
            </div>
            <ContactSummary properties={properties} />
            <div className="pl1 pr1">
                <ContactViewProperties contactID={contactID} properties={properties} field="email" />
                {hasPaidMail ? (
                    <>
                        <ContactViewProperties contactID={contactID} properties={properties} field="tel" />
                        <ContactViewProperties contactID={contactID} properties={properties} field="adr" />
                        <ContactViewProperties contactID={contactID} properties={properties} />
                    </>
                ) : (
                    <div className="border-bottom mb1 pl1 pr1">
                        <h3 className="mb1">
                            <Icon name="lock" /> {c('Title').t`Encrypted details`}
                        </h3>
                        <Alert learnMore="TODO">{c('Info')
                            .t`Upgrade your plan to unlock encrypted details such as phone numbers and home addresses.`}</Alert>
                        <a href="/settings/dashboard" className="pm-button pm-button pm-button--primary">{c('Action')
                            .t`Upgrade`}</a>
                    </div>
                )}
            </div>
        </div>
    );
};

const ContactPropertyPropTypes = PropTypes.shape({
    value: PropTypes.oneOf(PropTypes.string, PropTypes.arrayOf(PropTypes.string)),
    type: PropTypes.string,
    group: PropTypes.string,
    field: PropTypes.string
});

ContactView.propTypes = {
    contactID: PropTypes.string,
    properties: PropTypes.arrayOf(ContactPropertyPropTypes),
    errors: PropTypes.array
};

export default ContactView;
