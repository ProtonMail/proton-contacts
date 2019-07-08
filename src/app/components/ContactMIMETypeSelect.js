import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'react-components';
import { c } from 'ttag';
import { MIME_TYPES } from 'proton-shared/lib/constants';

const ContactMIMETypeSelect = ({ value, onChange }) => {
    const options = [
        { text: c('MIME type').t`Automatic`, value: '' },
        { text: c('MIME type').t`Plain text`, value: MIME_TYPES.PLAINTEXT }
    ];
    const handleChange = ({ target }) => onChange(target.value);
    return <Select value={value} options={options} onChange={handleChange} />;
};

ContactMIMETypeSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};

export default ContactMIMETypeSelect;
