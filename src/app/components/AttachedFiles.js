import React, { useState, useEffect } from 'react';
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

const AttachedFiles = ({ files, iconName, className, clear, onClear, ...rest }) => {
    return (
        <>
            {files.map(({ name, size }, i) => {
                return (
                    <div className={`flex w100 ${className}`} key={`file-${name}`} {...rest}>
                        <div className="bordered-container p0-5 mb1 flex flex-spacebetween w10">
                            <Icon name={iconName} />
                        </div>
                        <div className="bordered-container p0-5 mb1 flex flex-spacebetween w90">
                            <div>
                                <div>{splitExtension(name)[0]}</div>
                                <div>{`${splitExtension(name)[1].toUpperCase()} - ${humanSize(size)}`}</div>
                            </div>
                            <Button onClick={() => onClear(files, i)}>{clear}</Button>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

AttachedFiles.propTypes = {
    files: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, size: PropTypes.number })),
    iconName: PropTypes.string.isRequired,
    clear: PropTypes.string,
    onClear: PropTypes.func
};

AttachedFiles.defaultProps = {
    files: [],
    clear: c('Action').t`Delete`
};

export default AttachedFiles;
