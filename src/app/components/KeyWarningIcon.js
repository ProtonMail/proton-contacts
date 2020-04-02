import React from 'react';
import PropTypes from 'prop-types';
import { classnames, Icon, Tooltip } from 'react-components';

import { getEmailMismatchWarning } from 'proton-shared/lib/keys/publicKeys';

const KeyWarningIcon = ({ publicKey, emailAddress, className }) => {
    if (!emailAddress) {
        return null;
    }
    const icon = <Icon name="attention" className={classnames([className, 'color-global-attention'])} />;
    const warning = getEmailMismatchWarning(publicKey, emailAddress);

    if (warning.length) {
        return <Tooltip title={warning[0]}>{icon}</Tooltip>;
    }

    return null;
};

KeyWarningIcon.propTypes = {
    publicKey: PropTypes.object.isRequired,
    emailAddress: PropTypes.string,
    className: PropTypes.string
};

export default KeyWarningIcon;
