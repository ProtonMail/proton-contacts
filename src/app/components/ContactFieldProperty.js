import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Input, TextArea, EmailInput, DateInput } from 'react-components';

import ContactImageField from './ContactImageField';
import ContactAdrField from './ContactAdrField';

const ContactFieldProperty = ({ field, value, onChange, ...rest }) => {
    const handleChange = ({ target }) => onChange(target.value);
    const val = Array.isArray(value) ? value[0] : value;

    if (field === 'email') {
        <EmailInput value={val} onChange={handleChange} {...rest} />;
    }

    if (field === 'adr') {
        return <ContactAdrField value={val} onChange={onChange} />;
    }

    if (field === 'note') {
        return <TextArea value={val} onChange={handleChange} {...rest} />;
    }

    if (field === 'bday' || field === 'anniversary') {
        const m = moment(val);
        if (m.isValid()) {
            return (
                <DateInput
                    setDefaultDate
                    defaultDate={m.toDate()}
                    onSelect={onChange}
                    format={moment.localeData().longDateFormat('L')}
                    {...rest}
                />
            );
        }
    }

    if (field === 'photo' || field === 'logo') {
        return <ContactImageField value={val} onChange={onChange} {...rest} />;
    }

    return <Input value={val} onChange={handleChange} {...rest} />;
};

ContactFieldProperty.propTypes = {
    field: PropTypes.string,
    value: PropTypes.oneOf(PropTypes.string, PropTypes.arrayOf(PropTypes.string)),
    onChange: PropTypes.func.isRequired
};

export default ContactFieldProperty;
