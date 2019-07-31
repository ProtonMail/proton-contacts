import React from 'react';
import PropTypes from 'prop-types';
import { Icon, RemoveImage } from 'react-components';

const ContactImageField = ({ value }) => {
    return <div className="mb1">{value ? <RemoveImage src={value} /> : <Icon name="contact" size={40} />}</div>;
};

ContactImageField.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};

export default ContactImageField;
