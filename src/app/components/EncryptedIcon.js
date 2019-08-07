import React from 'react';
import { Tooltip, Icon } from 'react-components';
import { c } from 'ttag';

const EncryptedIcon = ({ ...rest }) => {
    return (
        <Tooltip {...rest} title={c('Tooltip').t`Encrypted data with verified digital signature`}>
            <Icon name="lock" />
        </Tooltip>
    );
};

export default EncryptedIcon;
