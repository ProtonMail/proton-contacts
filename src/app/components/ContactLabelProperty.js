import React from 'react';
import PropTypes from 'prop-types';

import { getAllFieldLabels } from '../helpers/fields';

const ContactLabelProperty = ({ field, type, ...rest }) => {
    const labels = getAllFieldLabels();
    const label = labels[type] || type || labels[field];

    return (
        <label className="capitalize" {...rest}>
            {label}
        </label>
    );
};

ContactLabelProperty.propTypes = {
    field: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
};

export default ContactLabelProperty;
