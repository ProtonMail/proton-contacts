import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon } from 'react-components';
import contactLoader from 'design-system/assets/img/pm-images/contact-export-loader.gif';

const DyanmicProgress = ({ id, alt, displayDuring, displayEnd, value, max, endPostponed, ...rest }) => {
    return (
        <div className="aligncenter">
            {value < max ? (
                <img src={contactLoader} alt={`${alt}-loader`} />
            ) : (
                <Icon name="on" fill="success" size={100} alt={`${alt}-finished`} />
            )}
            <progress className="progress-contact w100 mt1" aria-describedby={id} value={value} max={max} {...rest} />
            <p aria-atomic="true" aria-live="polite" id="id">
                {value < max || endPostponed ? `${displayDuring}: ${value}%` : displayEnd}
            </p>
        </div>
    );
};

DyanmicProgress.propTypes = {
    id: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    displayDuring: PropTypes.string,
    displayEnd: PropTypes.string,
    value: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    endPostponed: PropTypes.bool.isRequired
};

DyanmicProgress.defaultProps = {
    displayDuring: c('Progress bar description').t`Progress`,
    displayEnd: c('Progress bar description').t`Completed`,
    max: 100,
    endPostponed: false
};

export default DyanmicProgress;
