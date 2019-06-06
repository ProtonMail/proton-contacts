import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormModal } from 'react-components';
import { c } from 'ttag';
import ContactRowProperty from './ContactRowProperty';

const DEFAULT_MODEL = [
    { field: 'fn', value: '' },
    { field: 'email', value: '' },
    { field: 'tel', value: '' },
    { field: 'adr', value: '' },
    { field: 'org', value: '' },
    { field: 'note', value: '' },
    { field: 'photo', value: '' }
];

// List of field where we let the user interact with
const FIELDS = [
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

const formatModel = (properties) => {
    return properties.filter(({ field }) => FIELDS.includes(field)); // Only includes editable properties that we decided
};

const clearModel = (properties) => {
    return properties.filter(({ value }) => value);
};

const ContactModal = ({ contactID, properties, ...rest }) => {
    const [model, setModel] = useState(contactID ? formatModel(properties) : DEFAULT_MODEL);
    const title = contactID ? c('Title').t`Edit contact details` : c('Title').t`Add new contact`;
    const handleAdd = (field) => setModel([...model, { field, value: '' }]);

    const handleSubmit = () => {
        const params = clearModel(model);
        console.log(params);
    };

    const handleChange = (index) => (value) => {
        const newModel = [...model];
        newModel[index].value = value;
        setModel(newModel);
    };

    const {
        fn: fnProperties,
        email: emailProperties,
        tel: telProperties,
        adr: adrProperties,
        rest: restProperties
    } = model.reduce(
        (acc, property, index) => {
            const { field } = property;
            const newProperty = { ...property, index };

            if (field === 'fn') {
                acc.fn.push(newProperty);
                return acc;
            }

            if (field === 'adr') {
                acc.adr.push(newProperty);
                return acc;
            }

            if (field === 'tel') {
                acc.tel.push(newProperty);
                return acc;
            }

            if (field === 'email') {
                acc.email.push(newProperty);
                return acc;
            }

            acc.rest.push(newProperty);

            return acc;
        },
        { fn: [], adr: [], tel: [], email: [], rest: [] }
    );

    return (
        <FormModal onSubmit={handleSubmit} title={title} submit={c('Action').t`Save`} {...rest}>
            {fnProperties.map((property, index) => (
                <ContactRowProperty
                    key={index.toString()}
                    property={property}
                    onChange={handleChange(property.index)}
                    onAdd={handleAdd}
                />
            ))}
            <hr />
            {emailProperties.map((property, index) => (
                <ContactRowProperty
                    first={!index}
                    last={emailProperties.length - 1 === index}
                    key={index.toString()}
                    property={property}
                    onChange={handleChange(property.index)}
                    onAdd={handleAdd}
                />
            ))}
            <hr />
            {telProperties.map((property, index) => (
                <ContactRowProperty
                    first={!index}
                    last={telProperties.length - 1 === index}
                    key={index.toString()}
                    property={property}
                    onChange={handleChange(property.index)}
                    onAdd={handleAdd}
                />
            ))}
            <hr />
            {adrProperties.map((property, index) => (
                <ContactRowProperty
                    first={!index}
                    last={adrProperties.length - 1 === index}
                    key={index.toString()}
                    property={property}
                    onChange={handleChange(property.index)}
                    onAdd={handleAdd}
                />
            ))}
            <hr />
            {restProperties.map((property, index) => (
                <ContactRowProperty
                    key={index.toString()}
                    property={property}
                    onChange={handleChange(property.index)}
                    onAdd={handleAdd}
                />
            ))}
        </FormModal>
    );
};

ContactModal.propTypes = {
    contactID: PropTypes.string,
    properties: PropTypes.array,
    onClose: PropTypes.func
};

export default ContactModal;
