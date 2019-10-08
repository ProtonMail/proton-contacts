import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { PACKAGE_TYPE } from 'proton-shared/lib/constants';
import { Select, useMailSettings } from 'react-components';
import { PGP_INLINE, PGP_MIME, PGP_INLINE_TEXT, PGP_MIME_TEXT } from '../constants';

const ContactSchemeSelect = ({ value, onChange }) => {
    const [{ PGPScheme }, loading] = useMailSettings();
    const defaultValue = PGPScheme === PACKAGE_TYPE.SEND_PGP_INLINE ? PGP_INLINE_TEXT : PGP_MIME_TEXT;

    const options = [
        { value: '', text: c('Default encryption scheme').t`Use global default (${defaultValue})` },
        { value: PGP_MIME, text: PGP_MIME_TEXT },
        { value: PGP_INLINE, text: PGP_INLINE_TEXT }
    ];

    const handleChange = ({ target }) => onChange(target.value);

    return <Select options={options} disabled={loading} value={value} onChange={handleChange} />;
};

ContactSchemeSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};

export default ContactSchemeSelect;
