import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, ButtonGroup, Icon, classnames } from 'react-components';
import { c } from 'ttag';

import { textToClipboard } from 'proton-shared/lib/helpers/browser';

const TooltipCopy = ({ value, className = '', inGroup = false }) => {
    const [copied, setCopied] = useState(false);

    const handleClick = () => {
        textToClipboard(value);

        if (!copied) {
            setCopied(true);
        }
    };

    return inGroup ? (
        <ButtonGroup className={className}>
            <Tooltip
                onClick={handleClick}
                className={classnames([copied && 'copied'])}
                title={copied ? c('Label').t`Copied` : c('Label').t`Copy`}
            >
                <Icon name="clipboard" />
            </Tooltip>
        </ButtonGroup>
    ) : (
        <Button>
            <Tooltip
                onClick={handleClick}
                className={classnames([copied && 'copied'])}
                title={copied ? c('Label').t`Copied` : c('Label').t`Copy`}
            >
                <Icon name="clipboard" />
            </Tooltip>
        </Button>
    );
};

TooltipCopy.propTypes = {
    value: PropTypes.string.isRequired,
    className: PropTypes.string,
    inGroup: PropTypes.bool
};

export default TooltipCopy;
