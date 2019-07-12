import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { ResetButton, PrimaryButton } from 'react-components';

import { IMPORT_STEPS } from '../../constants';

const { ATTACHING, CHECKING_CSV, IMPORTING, IMPORT_GROUPS } = IMPORT_STEPS;

const ImportFooter = ({ step, vcardContacts }) => {
    const hasResetButton = step !== IMPORTING;
    const hasImportButton = step <= CHECKING_CSV;
    const hasCreateButton = step === IMPORT_GROUPS;

    return (
        <>
            {hasResetButton ? <ResetButton>{c('Action').t`Cancel`}</ResetButton> : null}
            {hasImportButton ? (
                <PrimaryButton
                    disabled={step === ATTACHING || (step === CHECKING_CSV && !vcardContacts.length)}
                    type="submit"
                >
                    {c('Action').t`Import`}
                </PrimaryButton>
            ) : !hasCreateButton ? (
                <PrimaryButton type="submit">{c('Action').t`Next`}</PrimaryButton>
            ) : (
                <PrimaryButton type="submit">{c('Action').t`Create`}</PrimaryButton>
            )}
        </>
    );
};

ImportFooter.propTypes = {
    step: PropTypes.number.isRequired,
    vcardContacts: PropTypes.array
};

export default ImportFooter;
