import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon, useContactEmails, useContactGroups } from 'react-components';
import { toMap } from 'proton-shared/lib/helpers/object';
import { normalize } from 'proton-shared/lib/helpers/string';

import ContactViewProperty from './ContactViewProperty';
import { OTHER_INFORMATION_FIELDS } from '../constants';

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

    const [contactEmails] = useContactEmails();
    const [contactGroups] = useContactGroups();
    const mapContactGroups = toMap(contactGroups);
    const filteredContactEmails = contactEmails.filter(({ ContactID }) => ContactID === contactID);
    const title = field ? TITLES[field] : TITLES.other;
    const iconName = field ? ICONS[field] : ICONS.other;
    const toExclude = ['photo', 'org', 'logo'];
    const fields = field ? [field] : OTHER_INFORMATION_FIELDS.filter((field) => !toExclude.includes(field));
    const properties = allProperties
        .filter(({ field }) => fields.includes(field))
        .map((property) => {
            if (field === 'email') {
                const email = Array.isArray(property.value) ? property.value[0] : property.value;
                const { LabelIDs = [] } =
                    filteredContactEmails.find(({ Email = '' }) => normalize(Email) === normalize(email)) || {};

                return {
                    ...property,
                    contactGroups: LabelIDs.map((labelID) => mapContactGroups[labelID])
                };
            }
            return property;
        });

    if (!properties.length) {
        return null;
    }

    return (
        <div className="border-bottom mb1 pl1 pr1">
            <h3 className="mb1 flex flex-nowrap flex-items-center">
                <Icon name={iconName} className="mr0-5" />
                <span className="mr0-5">{title}</span>
                {field === 'email' ? null : <Icon name="lock" />}
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
