import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'react-components';
import { c } from 'ttag';
import { MIME_TYPES, MIME_TYPES_MORE } from 'proton-shared/lib/constants';

const ContactMIMETypeSelect = ({ value, onChange, disabled }) => {
    const options = [
        { text: c('MIME type').t`Automatic`, value: MIME_TYPES_MORE.AUTOMATIC },
        { text: c('MIME type').t`Plain text`, value: MIME_TYPES.PLAINTEXT }
    ];
    const handleChange = ({ target }) => onChange(target.value);
    return <Select value={value} options={options} disabled={disabled} onChange={handleChange} />;
};

ContactMIMETypeSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool
};

export default ContactMIMETypeSelect;
