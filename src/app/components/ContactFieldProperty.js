import React from 'react';
import PropTypes from 'prop-types';
import { useModals, Input, TextArea, EmailInput, DateInput, TelInput } from 'react-components';
import { parseISO, toDate, isValid } from 'date-fns';
import { getAllFieldLabels } from '../helpers/fields';

import ContactImageField from './ContactImageField';
import ContactAdrField from './ContactAdrField';
import ContactImageModal from './ContactImageModal';

const ContactFieldProperty = ({ field, value, uid, onChange, ...rest }) => {
    const { createModal } = useModals();
    const labels = getAllFieldLabels();

    const handleChange = ({ target }) => onChange({ value: target.value, uid });

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
        const date = value === '' ? toDate(Date.now()) : parseISO(value);
        if (isValid(date)) {
            const handleSelectDate = (date) => onChange({ value: date.toISOString(), uid });
            return <DateInput placeholder={labels[field]} value={date} onChange={handleSelectDate} {...rest} />;
        }
    }

    if (field === 'photo' || field === 'logo') {
        const handleChangeImage = () => {
            const handleSubmit = (value) => onChange({ uid, value });
            createModal(<ContactImageModal url={value} onSubmit={handleSubmit} />);
        };
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
