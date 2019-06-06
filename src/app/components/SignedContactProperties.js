import React from 'react';
import PropTypes from 'prop-types';
import { Bordered, useContactEmails, useContactGroups } from 'react-components';
import { toMap } from 'proton-shared/lib/helpers/object';
import { normalize } from 'proton-shared/lib/helpers/string';

import ContactViewProperty from './ContactViewProperty';

const SignedContactProperties = ({ properties: allProperties, contactID }) => {
    const [contactEmails] = useContactEmails();
    const [contactGroups] = useContactGroups();
    const mapContactGroups = toMap(contactGroups);
    const filteredContactEmails = contactEmails.filter(({ ContactID }) => ContactID === contactID);
    const properties = allProperties
        .filter(({ field }) => field === 'email')
        .map((property, index) => {
            const email = Array.isArray(property.value) ? property.value[0] : property.value;
            const { LabelIDs = [] } =
                filteredContactEmails.find(({ Email = '' }) => normalize(Email) === normalize(email)) || {};

            return {
                ...property,
                first: !index,
                contactGroups: LabelIDs.map((labelID) => mapContactGroups[labelID])
            };
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

SignedContactProperties.propTypes = {
    contactID: PropTypes.string,
    properties: PropTypes.array
};

export default SignedContactProperties;
