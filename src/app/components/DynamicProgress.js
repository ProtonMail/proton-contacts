import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon, Loader, classnames, Progress } from 'react-components';

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
    const loading = value < max || endPostponed;
    const icon = loading ? (
        <Loader />
    ) : failed ? (
        <Icon name="off" className="color-global-warning" size={100} alt={`${alt}-finished`} />
    ) : (
        <Icon name="on" className="color-global-success" size={100} alt={`${alt}-finished`} />
    );
    const displayEnd = failed ? displayFailed : displaySuccess;

    return (
        <div className="aligncenter">
            {icon}
            <Progress
                className={classnames(['mt1', failed && 'progressbar--error'])}
                aria-describedby={id}
                value={value}
                max={max}
                {...rest}
            />
            <p aria-atomic="true" aria-live="polite" id="id">
                {loading ? `${displayDuring}: ${value}%` : displayEnd}
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
