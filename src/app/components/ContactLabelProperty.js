import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'react-components';

import { getFieldLabels } from '../helpers/fields';

const ContactLabelProperty = ({ field, type, ...rest }) => {
    const labels = getFieldLabels();
    const label = labels[type] || type || labels[field];

    return (
        <Label className="capitalize" {...rest}>
            {label}
        </Label>
    );
};

ContactLabelProperty.propTypes = {
    field: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
};

export default ContactLabelProperty;
