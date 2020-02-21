import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { classnames, Icon, Tooltip } from 'react-components';

import { emailMismatch } from '../helpers/pgp';

const KeyWarningIcon = ({ publicKey, email, className }) => {
    const icon = <Icon name="attention" className={classnames([className, 'color-global-attention'])} />;
    const assignedEmails = emailMismatch(publicKey, email); // Returns Boolean|Array<String>

    if (assignedEmails) {
        const emails = assignedEmails.join(', ');
        return <Tooltip title={c('PGP key warning').t`This key is assigned to ${emails}`}>{icon}</Tooltip>;
    }

    return null;
};

KeyWarningIcon.propTypes = {
    publicKey: PropTypes.object.isRequired,
    email: PropTypes.string.isRequired,
    className: PropTypes.string
};

export default KeyWarningIcon;
