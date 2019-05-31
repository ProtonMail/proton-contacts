import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Icon } from 'react-components';

const ContactGroupIcon = ({ name, color }) => {
    return (
        <Tooltip title={name}>
            <Icon name="contacts-groups" color={color} />
        </Tooltip>
    );
};

ContactGroupIcon.propTypes = {
    name: PropTypes.string,
    color: PropTypes.color
};

export default ContactGroupIcon;
