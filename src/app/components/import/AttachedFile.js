import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Icon, Button } from 'react-components';

import humanSize from 'proton-shared/lib/helpers/humanSize';

const splitExtension = (filename) => {
    if (!/\./.test(filename)) {
        return [filename, ''];
    }
    const ext = filename.split('.').pop();
    const name = filename.substring(0, filename.length - ext.length - 1);

    return [name, ext];
};

const AttachedFile = ({ file, iconName, className, clear, onClear, ...rest }) => {
    const [fileName, extension] = splitExtension(file.name);

    return (
        <div className={`flex bordered-container w100 ${className}`} {...rest}>
            <div className=" p0-5 flex flex-item-noshrink w10">
                <Icon name={iconName} className="mauto" />
            </div>
            <div className="message-attachmentInfo p0-5 flex flex-nowrap w90">
                <div className="flex-item-fluid pr1">
                    <div className="ellipsis" title={fileName}>
                        {fileName}
                    </div>
                    <div>{`${extension.toUpperCase()} - ${humanSize(file.size)}`}</div>
                </div>
                <Button className="flex-item-noshrink" onClick={onClear}>
                    {clear}
                </Button>
            </div>
        </div>
    );
};

AttachedFile.propTypes = {
    file: PropTypes.instanceOf(File).isRequired,
    iconName: PropTypes.string.isRequired,
    clear: PropTypes.string,
    onClear: PropTypes.func
};

AttachedFile.defaultProps = {
    clear: c('Action').t`Delete`
};

export default AttachedFile;
