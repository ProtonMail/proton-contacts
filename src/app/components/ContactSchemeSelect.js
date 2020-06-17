import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Select } from 'react-components';
import { PACKAGE_TYPE, PGP_SCHEMES, PGP_SCHEME_TEXT, PGP_SCHEMES_MORE } from 'proton-shared/lib/constants';

const { PGP_MIME, PGP_INLINE } = PGP_SCHEMES;

const ContactSchemeSelect = ({ value, mailSettings, onChange }) => {
    const { PGPScheme } = mailSettings;
    const defaultValueText = PGPScheme === PACKAGE_TYPE.SEND_PGP_INLINE ? PGP_SCHEME_TEXT.INLINE : PGP_SCHEME_TEXT.MIME;

    const options = [
        {
            value: PGP_SCHEMES_MORE.GLOBAL_DEFAULT,
            text: c('Default encryption scheme').t`Use global default (${defaultValueText})`
        },
        { value: PGP_MIME, text: PGP_SCHEME_TEXT.MIME },
        { value: PGP_INLINE, text: PGP_SCHEME_TEXT.INLINE }
    ];

    const handleChange = ({ target }) => onChange(target.value);

    return <Select options={options} value={value} onChange={handleChange} />;
};

ContactSchemeSelect.propTypes = {
    value: PropTypes.string,
    mailSettings: PropTypes.object,
    onChange: PropTypes.func
};

export default ContactSchemeSelect;
