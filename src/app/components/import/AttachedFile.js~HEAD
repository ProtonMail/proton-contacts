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
        <div className={`flex w100 ${className}`} {...rest}>
            <div className="bordered-container p0-5 mb1 flex flex-spacebetween w10">
                <Icon name={iconName} />
            </div>
            <div className="bordered-container p0-5 mb1 flex flex-spacebetween w90">
                <div>
                    <div>{fileName}</div>
                    <div>{`${extension.toUpperCase()} - ${humanSize(file.size)}`}</div>
                </div>
                <Button onClick={onClear}>{clear}</Button>
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
