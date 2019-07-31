import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon } from 'react-components';
import contactLoader from 'design-system/assets/img/pm-images/contact-export-loader.gif';

const DynamicProgress = ({
    id,
    alt,
    displayDuring = c('Progress bar description').t`Progress`,
    displaySuccess = c('Progress bar description').t`Completed`,
    displayFailed = c('Progress bar description').t`Failed`,
    value,
    max = 100,
    endPostponed = false,
    failed = false,
    ...rest
}) => {
    const icon =
        value < max ? (
            <img src={contactLoader} alt={`${alt}-loader`} />
        ) : failed ? (
            <Icon name="off" fill="warning" size={100} alt={`${alt}-finished`} />
        ) : (
            <Icon name="on" fill="success" size={100} alt={`${alt}-finished`} />
        );
    const displayEnd = failed ? displayFailed : displaySuccess;

    return (
        <div className="aligncenter">
            {icon}
            <progress className="progress-contact w100 mt1" aria-describedby={id} value={value} max={max} {...rest} />
            <p aria-atomic="true" aria-live="polite" id="id">
                {value < max || endPostponed ? `${displayDuring}: ${value}%` : displayEnd}
            </p>
        </div>
    );
};

DynamicProgress.propTypes = {
    id: PropTypes.string,
    alt: PropTypes.string.isRequired,
    displayDuring: PropTypes.string,
    displaySuccess: PropTypes.string,
    displayFailed: PropTypes.string,
    value: PropTypes.number.isRequired,
    max: PropTypes.number,
    endPostponed: PropTypes.bool,
    failed: PropTypes.bool
};

export default DynamicProgress;
