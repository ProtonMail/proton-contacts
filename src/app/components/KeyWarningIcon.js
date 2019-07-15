import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon, Tooltip } from 'react-components';

import { emailMismatch } from '../helpers/pgp';

const KeyWarningIcon = ({ publicKey, isRevoked, isExpired, email, ...rest }) => {
    const icon = <Icon name="attention" fill="attention" {...rest} />;
    const assignedEmails = emailMismatch(publicKey, email); // Returns Boolean|Array<String>

    if (assignedEmails) {
        const emails = assignedEmails.join(', ');
        return <Tooltip title={c('PGP key warning').t`This key is assigned to ${emails}`}>{icon}</Tooltip>;
    }

    if (isRevoked) {
        return <Tooltip title={c('PGP key warning').t`This key is revoked`}>{icon}</Tooltip>;
    }

    if (isExpired) {
        return <Tooltip title={c('PGP key warning').t`This key is expired`}>{icon}</Tooltip>;
    }

    return null;
};

KeyWarningIcon.propTypes = {
    publicKey: PropTypes.object.isRequired,
    isExpired: PropTypes.bool,
    isRevoked: PropTypes.bool,
    email: PropTypes.string.isRequired
};

export default KeyWarningIcon;
