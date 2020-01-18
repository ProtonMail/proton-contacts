import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Button, img } from 'react-components';

const ContactImageField = ({ value, onChange }) => {
    return (
        <div>
            {value ? (
                <img src={value} referrerPolicy="no-referrer" />
            ) : (
                <Button onClick={onChange}>{c('Action').t`Upload picture`}</Button>
            )}
        </div>
    );
};

ContactImageField.propTypes = {
    show: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func
};

export default ContactImageField;
