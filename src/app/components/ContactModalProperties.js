import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon } from 'react-components';

import ContactModalRow from './ContactModalRow';
import { OTHER_INFORMATION_FIELDS } from '../constants';

const ICONS = {
    fn: 'contact',
    email: 'email',
    tel: 'phone',
    adr: 'address',
    other: 'info'
};

const ContactModalProperties = ({ properties: allProperties, field, onChange, onAdd, onRemove }) => {
    const TITLES = {
        fn: c('Title').t`Display name`,
        email: c('Title').t`Email addresses`,
        tel: c('Title').t`Phone numbers`,
        adr: c('Title').t`Addresses`,
        other: c('Title').t`Other information`
    };

    const title = field ? TITLES[field] : TITLES.other;
    const iconName = field ? ICONS[field] : ICONS.other;
    const fields = field ? [field] : OTHER_INFORMATION_FIELDS;
    const properties = allProperties.filter(({ field }) => fields.includes(field));

    return (
        <div className="border-bottom mb1">
            <h3 className="mb1">
                <Icon name={iconName} /> {title}
            </h3>
            {properties.map((property, index) => (
                <ContactModalRow
                    first={!index}
                    last={properties.length - 1 === index}
                    key={property.uid}
                    property={property}
                    onChange={onChange}
                    onRemove={onRemove}
                    onAdd={onAdd}
                />
            ))}
        </div>
    );
};

ContactModalProperties.propTypes = {
    field: PropTypes.string,
    properties: PropTypes.array,
    onChange: PropTypes.func,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func
};

export default ContactModalProperties;
