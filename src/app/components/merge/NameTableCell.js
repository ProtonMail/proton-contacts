import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, classnames } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

const NameTableCell = ({ name, contactID, highlightedID, checked, deleted, greyedOut, onToggle }) => {
    const handleToggle = () => onToggle(contactID);

    return (
        <div className="flex flex-nowrap flex-align-items-center">
            <Checkbox
                checked={checked}
                onChange={handleToggle}
                className={`flex flex-align-items-center flex-item-noshrink mr0-5 ${
                    deleted ? 'visibility-hidden' : ''
                }`}
            />
            <span
                className={classnames([
                    'max-w100',
                    'inline-block',
                    'text-ellipsis',
                    opaqueClassName(greyedOut),
                    contactID === highlightedID && 'text-bold',
                ])}
            >
                {name}
            </span>
        </div>
    );
};

NameTableCell.propTypes = {
    contactID: PropTypes.string.isRequired,
    highlightedID: PropTypes.string,
    checked: PropTypes.bool,
    deleted: PropTypes.bool,
    greyedOut: PropTypes.bool,
    name: PropTypes.string,
    onToggle: PropTypes.func,
};

export default NameTableCell;
