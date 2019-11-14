import React from 'react';
import PropTypes from 'prop-types';
import { Select, Label } from 'react-components';

import { getOtherInformationFields } from '../helpers/fields';
import { getAllTypes } from '../helpers/types';

import ContactLabelProperty from './ContactLabelProperty';

const ContactModalLabel = ({ field, uid, type = '', onChange }) => {
    const types = getAllTypes();

    const otherInformationFields = getOtherInformationFields();

    const handleChangeType = ({ target }) => onChange({ value: target.value, key: 'type', uid });
    const handleChangeField = ({ target }) => onChange({ value: target.value, key: 'field', uid });

    if (otherInformationFields.map(({ value: f }) => f).includes(field)) {
        return (
            <Label className="pt0 mr1">
                <Select value={field} options={otherInformationFields} onChange={handleChangeField} />
            </Label>
        );
    }

    if (field === 'fn' || !types[field].map(({ value: type }) => type).includes(type)) {
        return <ContactLabelProperty field={field} type={type} />;
    }

    return (
        <Label className="pt0 mr1">
            <Select value={type} options={types[field]} onChange={handleChangeType} />
        </Label>
    );
};

ContactModalLabel.propTypes = {
    field: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    type: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

export default ContactModalLabel;
