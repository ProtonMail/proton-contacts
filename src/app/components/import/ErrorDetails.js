import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Details, Summary, Bordered } from 'react-components';

const ErrorDetails = ({ errors = [], loading, summary = c('Info on errors').t`Click for details` }) => {
    return (
        !!errors.length &&
        !loading && (
            <Details>
                <Summary>{summary}</Summary>
                <Bordered>
                    {errors
                        .sort(({ index: index1 }, { index: index2 }) => index1 - index2)
                        .map(({ index, message }) => (
                            <div key={index}>{message}</div>
                        ))}
                </Bordered>
            </Details>
        )
    );
};

ErrorDetails.propTypes = {
    errors: PropTypes.arrayOf(PropTypes.shape({ index: PropTypes.number, message: PropTypes.func })),
    loading: PropTypes.bool,
    summary: PropTypes.string
};

export default ErrorDetails;
