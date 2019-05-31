import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Row, Label, Field, Icon } from 'react-components';
import { clearType, getType, getValue } from '../helpers/property';
import { getLabels, getIcons } from '../helpers/field';

const ICONS = getIcons();

const ContactViewProperty = ({ property, field, first }) => {
    const LABELS = getLabels();
    const type = clearType(getType(property.type));
    const icon = <Icon className="mr1" name={ICONS[field]} />;
    const label = LABELS[type] || type || LABELS[field];
    const value = getValue(property.values);

    const getContent = () => {
        switch (field) {
            case 'email':
                return <a href={`mailto:${value}`}>{value}</a>;
            case 'tel':
                return <a href={`tel:${value}`}>{value}</a>;
            case 'bday':
            case 'anniversary': {
                const date = moment(value);
                if (date.isValid()) {
                    return date.format('LL');
                }
                return value;
            }
            case 'photo':
            case 'logo':
                return <img src={value} alt={field} />;
            case 'adr':
                return value
                    .split(',')
                    .filter(Boolean)
                    .map((val, index) => <div key={index.toString()}>{val}</div>);
            default:
                return value;
        }
    };

    return (
        <Row>
            <Label className="capitalize">
                {first ? icon : null}
                <span className={first ? '' : 'ml2'}>{label}</span>
            </Label>
            <Field className="w100">{getContent()}</Field>
        </Row>
    );
};

ContactViewProperty.propTypes = {
    first: PropTypes.bool,
    property: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired
};

export default ContactViewProperty;
