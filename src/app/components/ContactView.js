import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { useModals, useUser, PrimaryButton, Button } from 'react-components';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';

import ContactModal from './ContactModal';
import { toICAL } from '../helpers/vcard';
import ContactSummary from './ContactSummary';
import ContactViewProperties from './ContactViewProperties';
import ContactPromote from './ContactPromote';

const ContactView = ({ properties, contactID }) => {
    // TODO handle errrors prop
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
        console.log(typeof vcard.toString());
        const blob = new Blob([vcard.toString()], { type: 'data:text/plain;charset=utf-8;' });

        downloadFile(blob, `${filename}.vcf`);
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
                    <div className="mb1 pl1 pr1">
                        <ContactPromote />
                    </div>
                )}
            </div>
        </div>
    );
};

const ContactPropertyPropTypes = PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
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
