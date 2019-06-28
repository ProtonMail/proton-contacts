import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert } from 'react-components';

import DynamicProgress from './DynamicProgress';

import { percentageProgress } from './../helpers/progress';

const ImportingModalContent = ({ imported, notImported, total }) => {
    return (
        <>
            <Alert>
                {c('Description')
                    .t`Importing contacts... This may take a few minutes. When the process is completed, you can close this modal.`}
            </Alert>
            <DynamicProgress
                id="progress-import-contacts"
                alt="contact-loader"
                value={percentageProgress(imported, notImported, total)}
                displayEnd={c('Progress bar description')
                    .t`${imported} out of ${total} contacts successfully imported.`}
            />
        </>
    );
};

ImportingModalContent.propTypes = {
    imported: PropTypes.number.isRequired,
    notImported: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
};

export default ImportingModalContent;
