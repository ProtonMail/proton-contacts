import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, classnames } from 'react-components';
import { c } from 'ttag';

import { textToClipboard } from 'proton-shared/lib/helpers/browser';

const TooltipCopy = ({ value, className = '' }) => {
    const [copied, setCopied] = useState(false);

    const handleClick = () => {
        textToClipboard(value);

        if (!copied) {
            setCopied(true);
        }
    };

    return (
        <Tooltip
            onClick={handleClick}
            className={classnames([className, copied && 'copied'])}
            title={copied ? c('Label').t`Copied` : c('Label').t`Copy`}
        >
            <Button icon="clipboard" className="flex flex-item-centered" />
        </Tooltip>
    );
};

TooltipCopy.propTypes = {
    value: PropTypes.string.isRequired,
    className: PropTypes.string
};

export default TooltipCopy;
