import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Row, Label, Field, Icon } from 'react-components';
import { c } from 'ttag';
import { clearType, getType, getValue } from '../helpers/vcard';

const ContactViewProperty = ({ property, field, first }) => {
    const LABELS = {
        work: c('Label').t`Work`,
        home: c('Label').t`Personal`,
        cell: c('Label').t`Mobile`,
        email: c('Label').t`Email`,
        org: c('Label').t`Organization`,
        tel: c('Label').t`Phone`,
        adr: c('Label').t`Address`,
        bday: c('Label').t`Birthday`,
        anniversary: c('Label').t`Anniversary`,
        title: c('Label').t`Title`,
        role: c('Label').t`Role`,
        note: c('Label').t`Note`,
        url: c('Label').t`URL`,
        gender: c('Label').t`Gender`,
        lang: c('Label').t`Language`,
        tz: c('Label').t`Timezone`,
        geo: c('Label').t`Geo`,
        logo: c('Label').t`Logo`,
        member: c('Label').t`Member`
    };

    const ICONS = {
        email: 'email',
        org: 'organization',
        tel: 'phone',
        adr: 'address',
        bday: 'birthday',
        anniversary: 'anniversary',
        title: 'title',
        role: 'role',
        note: 'note',
        url: 'domains',
        gender: 'gender',
        lang: 'alias', // TODO icon missing
        tz: 'alias', // TODO icon missing
        geo: 'domains',
        logo: 'photo',
        member: 'member-contact'
    };

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
    property: PropTypes.object,
    field: PropTypes.string
};

export default ContactViewProperty;
