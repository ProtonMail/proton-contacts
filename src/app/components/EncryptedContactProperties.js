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

const EncryptedContactProperties = ({ contact }) => {
    const properties = FIELDS.reduce((acc, field) => {
        const p = contact[field] || [];

        if (p.length) {
            p.forEach((property, index) => {
                acc.push({ property, field, first: !index });
            });
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
