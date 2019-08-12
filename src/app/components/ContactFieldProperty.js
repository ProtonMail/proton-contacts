import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Input, TextArea, EmailInput, DateInput, TelInput } from 'react-components';

import ContactImageField from './ContactImageField';
import ContactAdrField from './ContactAdrField';
import { getAllFieldLabels } from '../helpers/fields';

const ContactFieldProperty = ({ field, value, uid, onChange, ...rest }) => {
    const handleChange = ({ target }) => onChange({ value: target.value, uid });
    const labels = getAllFieldLabels();

    if (field === 'email') {
        return <EmailInput value={value} placeholder={labels.email} onChange={handleChange} {...rest} />;
    }

    if (field === 'tel') {
        return <TelInput value={value} placeholder={labels.tel} onChange={handleChange} {...rest} />;
    }

    if (field === 'adr') {
        const handleChangeAdr = (adr) => onChange({ value: adr, uid });
        return <ContactAdrField value={value} onChange={handleChangeAdr} />;
    }

    if (field === 'note') {
        return <TextArea value={value} placeholder={labels.note} onChange={handleChange} {...rest} />;
    }

    if (field === 'bday' || field === 'anniversary') {
        const m = moment(value);
        if (value === '' || m.isValid()) {
            const handleSelectDate = (date) => onChange({ value: date, uid });
            return (
                <DateInput
                    setDefaultDate
                    placeholder={labels[field]}
                    defaultDate={m.toDate()}
                    onSelect={handleSelectDate}
                    format={moment.localeData().longDateFormat('L')}
                    {...rest}
                />
            );
        }
    }

    if (field === 'photo' || field === 'logo') {
        const handleChangeImage = (url) => onChange({ value: url, uid });
        return <ContactImageField value={value} onChange={handleChangeImage} {...rest} />;
    }
    return <Input value={value} placeholder={labels[field]} onChange={handleChange} {...rest} />;
};

ContactFieldProperty.propTypes = {
    field: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string), PropTypes.object]),
    onChange: PropTypes.func.isRequired
};

export default ContactFieldProperty;
