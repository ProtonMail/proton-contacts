import React from 'react';
import PropTypes from 'prop-types';
import { Bordered, useContactEmails, useContactGroups } from 'react-components';
import { toMap } from 'proton-shared/lib/helpers/object';
import { normalize } from 'proton-shared/lib/helpers/string';

import ContactViewProperty from './ContactViewProperty';

const SignedContactProperties = ({ contact, contactID }) => {
    const [contactEmails] = useContactEmails();
    const [contactGroups] = useContactGroups();
    const mapContactGroups = toMap(contactGroups);
    const filteredContactEmails = contactEmails.filter(({ ContactID }) => ContactID === contactID);
    const { email = [] } = contact;
    const properties = email.map((property) => {
        const [email = ''] = property.values || [];
        const { LabelIDs = [] } =
            filteredContactEmails.find(({ Email = '' }) => normalize(Email) === normalize(email)) || {};

        return {
            ...property,
            contactGroups: LabelIDs.map((labelID) => mapContactGroups[labelID])
        };
    });

    if (!properties.length) {
        return null;
    }

    return (
        <Bordered>
            {properties.map((property, index) => {
                return <ContactViewProperty first={!index} key={index.toString()} field="email" property={property} />;
            })}
        </Bordered>
    );
};

SignedContactProperties.propTypes = {
    contactID: PropTypes.string,
    contact: PropTypes.object
};

export default SignedContactProperties;
