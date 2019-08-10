import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert } from 'react-components';

import { percentageProgress } from '../../helpers/progress';

import DynamicProgress from '../DynamicProgress';

const MergingModalContent = ({ merged = [], notMerged = [], submitted = [], notSubmitted = [], total = 0 }) => {
    return (
        <>
            <Alert>
                {c('Description')
                    .t`Merging contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-merge-contacts"
                alt="contact-loader"
                value={percentageProgress(merged.length, notMerged.length, total)}
                failed={!submitted.length}
                displaySuccess={c('Progress bar description')
                    .t`${submitted.length} out of ${total} contacts successfully merged.`}
                displayFailed={c('Progress bar description').t`No contacts merged.`}
                endPostponed={submitted.length + notSubmitted.length !== total}
            />
        </>
    );
};

MergingModalContent.propTypes = {
    merged: PropTypes.array,
    notMerged: PropTypes.array,
    submitted: PropTypes.array,
    notSubmitted: PropTypes.array,
    isFinished: PropTypes.bool
};

export default MergingModalContent;
