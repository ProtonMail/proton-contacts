import React from 'react';
import PropTypes from 'prop-types';
import { Label, Icon } from 'react-components';

import { getLabels, getIcons } from '../helpers/field';

const ICONS = getIcons();

const ContactLabelProperty = ({ first, field, type }) => {
    const LABELS = getLabels();
    const label = LABELS[type] || type || LABELS[field];
    const iconName = ICONS[field];

    return (
        <Label className="capitalize">
            {first ? <Icon className="mr1" name={iconName} /> : null}
            <span className={first ? undefined : 'ml2'}>{label}</span>
        </Label>
    );
};

ContactLabelProperty.propTypes = {
    first: PropTypes.bool,
    field: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
};

ContactLabelProperty.defaultProps = {
    first: false
};

export default ContactLabelProperty;
