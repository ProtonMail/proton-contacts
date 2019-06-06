import React from 'react';
import PropTypes from 'prop-types';
import { Bordered } from 'react-components';

import ContactViewProperty from './ContactViewProperty';

const FIELDS = [
    'bday',
    'anniversary',
    'gender',
    'adr',
    'tel',
    'lang',
    'tz',
    'geo',
    'title',
    'role',
    'logo',
    'org',
    'member',
    'note',
    'url'
];

const EncryptedContactProperties = ({ properties: allProperties }) => {
    const MAP_FIRST = Object.create(null);
    const properties = allProperties
        .filter(({ field }) => FIELDS.includes(field))
        .map((property) => {
            const { field } = property;
            if (!MAP_FIRST[field]) {
                property.first = !MAP_FIRST[field];
                MAP_FIRST[field] = true;
            }
            return property;
        });

    if (!properties.length) {
        return null;
    }

    return (
        <Bordered>
            {properties.map((property, index) => {
                return <ContactViewProperty key={index.toString()} property={property} />;
            })}
        </Bordered>
    );
};

EncryptedContactProperties.propTypes = {
    properties: PropTypes.array
};

export default EncryptedContactProperties;
