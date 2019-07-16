import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon, Href } from 'react-components';
import { SIGNATURE_NOT_VERIFIED, FAIL_TO_READ, FAIL_TO_DECRYPT } from '../constants';

const ContactViewErrors = ({ errors }) => {
    if (errors.includes(SIGNATURE_NOT_VERIFIED)) {
        return (
            <div className="bg-global-attention p1">
                <Icon name="attention" className="mr1" />
                <span className="mr1">{c('Warning')
                    .t`Warning: the verification of this contact's signature failed.`}</span>
                <Href url="https://protonmail.com/support/knowledge-base/encrypted-contacts/">{c('Link')
                    .t`Learn more`}</Href>
            </div>
        );
    }

    if (errors.includes(FAIL_TO_READ)) {
        return (
            <div className="bg-global-warning p1">
                <Icon name="attention" className="mr1" />
                <span className="mr1">{c('Warning')
                    .t`Error: the encrypted content failed decryption and cannot be read.`}</span>
                <Href url="https://protonmail.com/support/knowledge-base/encrypted-contacts/">{c('Link')
                    .t`Learn more`}</Href>
            </div>
        );
    }

    if (errors.includes(FAIL_TO_DECRYPT)) {
        return (
            <div className="bg-global-warning p1">
                <Icon name="attention" className="mr1" />
                <span className="mr1">{c('Warning')
                    .t`Error: the encrypted content failed decryption and cannot be read.`}</span>
                <Href url="https://protonmail.com/support/knowledge-base/encrypted-contacts/">{c('Link')
                    .t`Learn more`}</Href>
            </div>
        );
    }

    return null;
};

ContactViewErrors.propTypes = {
    errors: PropTypes.array
};

ContactViewErrors.defaultProps = {
    errors: []
};

export default ContactViewErrors;
