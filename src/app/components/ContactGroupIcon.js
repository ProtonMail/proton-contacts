import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-components';

const ContactGroupIcon = ({ name, color }) => {
    return <Icon title={name} name="contacts-groups" color={color} />;
};

ContactGroupIcon.propTypes = {
    name: PropTypes.string,
    color: PropTypes.color
};

export default ContactGroupIcon;
