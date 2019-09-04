import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon, useContactEmails } from 'react-components';

import ContactViewProperty from './ContactViewProperty';
import { OTHER_INFORMATION_FIELDS } from '../constants';
import EncryptedIcon from './EncryptedIcon';

const ICONS = {
    email: 'email',
    tel: 'phone',
    adr: 'address',
    other: 'info'
};

const ContactViewProperties = ({ properties: allProperties, contactID, field }) => {
    const TITLES = {
        email: c('Title').t`Email addresses`,
        tel: c('Title').t`Phone numbers`,
        adr: c('Title').t`Addresses`,
        other: c('Title').t`Other information`
    };
    const title = field ? TITLES[field] : TITLES.other;
    const iconName = field ? ICONS[field] : ICONS.other;
    const toExclude = ['photo', 'org', 'logo'];
    const fields = field ? [field] : OTHER_INFORMATION_FIELDS.filter((field) => !toExclude.includes(field));

    const [contactEmails] = useContactEmails();
    const filteredContactEmails = contactEmails.filter(({ ContactID }) => ContactID === contactID);
    /*
        Each email has an emailD. This ID is present in `contactEmails`, but lost in `properties`.
        The emailID is needed for dealing with contact groups, so we need a way to recover it from `properties`
        To do that, we use the fact that for a given user, the email properties appear in the same order as
        in the variable `filteredContactEmails`. We add the contactEmail to these email properties
    */
    const reservoir = [...filteredContactEmails];
    const mapContactEmails = allProperties.map((property) =>
        property.field === 'email' ? reservoir.shift() : undefined
    );
    const properties = allProperties
        .map((property, i) => (field === 'email' ? { ...property, contactEmail: mapContactEmails[i] } : property))
        .filter(({ field }) => fields.includes(field));

    if (!properties.length) {
        return null;
    }

    return (
        <div className="border-bottom mb1 pl1 pr1">
            <h3 className="mb1 flex flex-nowrap flex-items-center">
                <Icon name={iconName} className="mr0-5" />
                <span className="mr0-5">{title}</span>
                {field === 'email' ? null : <EncryptedIcon />}
            </h3>
            {properties.map((property, index) => {
                return (
                    <ContactViewProperty
                        key={index.toString()}
                        contactID={contactID}
                        property={property}
                        properties={allProperties}
                    />
                );
            })}
        </div>
    );
};

ContactViewProperties.propTypes = {
    properties: PropTypes.array,
    contactID: PropTypes.string,
    field: PropTypes.string
};

export default ContactViewProperties;
