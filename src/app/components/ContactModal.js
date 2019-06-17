import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormModal, Alert, useUser } from 'react-components';
import { c } from 'ttag';

import ContactModalProperties from './ContactModalProperties';
import ContactPromote from './ContactPromote';
import { randomIntFromInterval } from 'proton-shared/lib/helpers/function';
import { OTHER_INFORMATION_FIELDS } from '../constants';
import { generateUID } from 'react-components/helpers/component';

const DEFAULT_MODEL = [
    { field: 'fn', value: '' },
    { field: 'email', value: '' },
    { field: 'tel', value: '' },
    { field: 'adr', value: '' },
    { field: 'org', value: '' },
    { field: 'note', value: '' }
];

// List of field where we let the user interact with
const EDITABLE_FIELDS = [
    'fn',
    'email',
    'tel',
    'adr',
    'org',
    'note',
    'photo',
    'logo',
    'bday',
    'anniversary',
    'gender',
    'title',
    'role',
    'member',
    'url'
];

const UID_PREFIX = 'contact-property';

const formatModel = (properties) => {
    if (!properties) {
        return DEFAULT_MODEL.map((property) => ({ ...property, uid: generateUID(UID_PREFIX) })); // Add UID to localize the property easily;
    }
    return properties
        .filter(({ field }) => EDITABLE_FIELDS.includes(field)) // Only includes editable properties that we decided
        .map((property) => ({ ...property, uid: generateUID(UID_PREFIX) })); // Add UID to localize the property easily
};

const clearModel = (properties) => {
    return properties.filter(({ value }) => value);
};

const ContactModal = ({ contactID, properties: initialProperties, ...rest }) => {
    const [{ hasPaidMail }] = useUser();
    const [properties, setProperties] = useState(formatModel(initialProperties));
    const title = contactID ? c('Title').t`Edit contact details` : c('Title').t`Add new contact`;

    const handleRemove = (propertyUID) => {
        setProperties(properties.filter(({ uid }) => uid !== propertyUID));
    };

    const handleAdd = (field) => () => {
        if (!field) {
            // Get random field from other info
            const index = randomIntFromInterval(0, OTHER_INFORMATION_FIELDS.length - 1);
            return setProperties([
                ...properties,
                { field: OTHER_INFORMATION_FIELDS[index], value: '', uid: generateUID(UID_PREFIX) }
            ]);
        }
        setProperties([...properties, { field, value: '', uid: generateUID(UID_PREFIX) }]);
    };

    const handleSubmit = () => {
        const params = clearModel(properties);
        console.log(params);
    };

    const handleChange = ({ uid: propertyUID, value, key = 'value' }) => {
        const newProperties = properties.map((property) => {
            if (property.uid === propertyUID) {
                property[key] = value;
            }
            return property;
        });
        setProperties(newProperties);
    };

    return (
        <FormModal onSubmit={handleSubmit} title={title} submit={c('Action').t`Save`} {...rest}>
            <Alert>{c('Info')
                .t`Email address, phone number and address at the top of their respective list are automatically set as the default information and will be displayed in the contact information's summary section.`}</Alert>
            <ContactModalProperties
                properties={properties}
                field="fn"
                onChange={handleChange}
                onRemove={handleRemove}
            />
            <ContactModalProperties
                properties={properties}
                field="email"
                onChange={handleChange}
                onRemove={handleRemove}
                onAdd={handleAdd('email')}
            />
            {hasPaidMail ? (
                <>
                    <ContactModalProperties
                        properties={properties}
                        field="tel"
                        onChange={handleChange}
                        onRemove={handleRemove}
                        onAdd={handleAdd('tel')}
                    />
                    <ContactModalProperties
                        properties={properties}
                        field="adr"
                        onChange={handleChange}
                        onRemove={handleRemove}
                        onAdd={handleAdd('adr')}
                    />
                    <ContactModalProperties
                        properties={properties}
                        onChange={handleChange}
                        onRemove={handleRemove}
                        onAdd={handleAdd()}
                    />
                </>
            ) : (
                <ContactPromote />
            )}
        </FormModal>
    );
};

ContactModal.propTypes = {
    contactID: PropTypes.string,
    properties: PropTypes.array,
    onClose: PropTypes.func
};

export default ContactModal;
