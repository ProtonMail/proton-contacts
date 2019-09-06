import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon } from 'react-components';

import ContactViewProperty from './ContactViewProperty';
import { OTHER_INFORMATION_FIELDS } from '../constants';
import EncryptedIcon from './EncryptedIcon';

const ICONS = {
    email: 'email',
    tel: 'phone',
    adr: 'address',
    other: 'info'
};

const ContactViewProperties = ({
    properties: allProperties,
    contactID,
    contactEmails,
    contactGroupsMap = {},
    field
}) => {
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

    const properties = allProperties.filter(({ field }) => fields.includes(field));

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
                const contactEmail = contactEmails && contactEmails[index];
                const contactGroups = contactEmail && contactEmail.LabelIDs.map((ID) => contactGroupsMap[ID]);

                return (
                    /*
                        Here we are hiddenly using the fact that the emails in
                        `properties` appear in the same order as in `contactEmails`
                    */
                    <ContactViewProperty
                        key={index.toString()}
                        contactID={contactID}
                        contactEmail={contactEmail}
                        contactGroups={contactGroups}
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
    contactID: PropTypes.string.isRequired,
    contactEmails: PropTypes.arrayOf(PropTypes.object),
    contactGroupsMap: PropTypes.object,
    field: PropTypes.string
};

export default ContactViewProperties;
