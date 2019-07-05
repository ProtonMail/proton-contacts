import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { ResetButton, PrimaryButton } from 'react-components';

import { IMPORT_STEPS } from '../../constants';

const { ATTACHING, CHECKING_CSV, IMPORTING } = IMPORT_STEPS;

const ImportFooter = ({ step, loading }) => {
    const hasResetButton = step !== IMPORTING;
    const hasImportButton = step <= CHECKING_CSV;

    return (
        <>
            {hasResetButton ? <ResetButton>{c('Action').t`Cancel`}</ResetButton> : null}
            {hasImportButton ? (
                <PrimaryButton disabled={step === ATTACHING} type="submit">
                    {c('Action').t`Import`}
                </PrimaryButton>
            ) : (
                <PrimaryButton loading={loading} type="submit">
                    {c('Action').t`Close`}
                </PrimaryButton>
            )}
        </>
    );
};

ImportFooter.propTypes = {
    step: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired
};

export default ImportFooter;
