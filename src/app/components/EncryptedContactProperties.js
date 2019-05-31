import React from 'react';
import PropTypes from 'prop-types';
import { Bordered } from 'react-components';

import ContactViewProperty from './ContactViewProperty';

const fieldsToDisplay = [
    'bday',
    'anniversary',
    'gender',
    'adr',
    'tel',
    'impp',
    'lang',
    'tz',
    'geo',
    'title',
    'role',
    'logo',
    'org',
    'member',
    'related',
    'note',
    'url'
];

const EncryptedContactProperties = ({ contact }) => {
    const properties = fieldsToDisplay.reduce((acc, field) => {
        const properties = contact[field];

        if (contact[field]) {
            if (Array.isArray(properties)) {
                properties.forEach((property, index) => {
                    acc.push({ property, field, first: !index });
                });
                return acc;
            }

            acc.push({ property: properties, field, first: true });
        }
        return acc;
    }, []);

    return (
        <Bordered>
            {properties.map(({ property, field, first }, index) => {
                return <ContactViewProperty first={first} key={index.toString()} field={field} property={property} />;
            })}
        </Bordered>
    );
};

EncryptedContactProperties.propTypes = {
    contact: PropTypes.object
};

export default EncryptedContactProperties;
