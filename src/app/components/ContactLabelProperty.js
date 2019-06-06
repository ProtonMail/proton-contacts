import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'react-components';

import { getLabels } from '../helpers/field';

const ContactLabelProperty = ({ field, type, ...rest }) => {
    const LABELS = getLabels();
    const label = LABELS[type] || type || LABELS[field];

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
