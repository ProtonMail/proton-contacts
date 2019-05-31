import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormModal, Bordered, Row, Label, Field } from 'react-components';
import { c } from 'ttag';
import { pick } from 'proton-shared/lib/helpers/object';
import { getProperties } from '../helpers/vcard';
import ContactRowProperty from './ContactRowProperty';

const DEFAULT_CONTACT = {
    fn: [],
    email: [],
    tel: [],
    adr: [],
    org: [],
    note: [],
    photo: []
};

const prepareModel = (contact) => {
    if (!contact) {
        return DEFAULT_CONTACT;
    }

    return pick(contact, Object.keys(DEFAULT_CONTACT));
};

const ContactModal = ({ contactID, contact, ...rest }) => {
    const [model, setModel] = useState(prepareModel(contact));
    const title = contactID ? c('Title').t`Edit contact` : c('Title').t`Add contact`;
    const properties = getProperties(model);

    const handleSubmit = () => {};

    return (
        <FormModal onSubmit={handleSubmit} title={title} submit={c('Action').t`Save`} {...rest}>
            {properties.map((property, index) => (
                <ContactRowProperty key={index.toString()} property={property} />
            ))}
        </FormModal>
    );
};

ContactModal.propTypes = {
    contactID: PropTypes.string,
    contact: PropTypes.object,
    onClose: PropTypes.func
};

export default ContactModal;
