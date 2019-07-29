import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

const NameTableCell = ({ name, checked, deleted, greyedOut, index, onToggle }) => {
    const handleToggle = () => onToggle(index);

    return (
        <div className="flex flex-nowrap flex-items-center">
            <Checkbox
                checked={checked}
                onChange={handleToggle}
                className={`flex flex-items-center mr0-5 ${deleted ? 'nonvisible' : ''}`}
            />
            <span className={`mw100 inbl ellipsis ${opaqueClassName(greyedOut)}`}>{name}</span>
        </div>
    );
};

NameTableCell.propTypes = {
    index: PropTypes.number.isRequired,
    checked: PropTypes.bool,
    deleted: PropTypes.bool,
    greyedOut: PropTypes.bool,
    name: PropTypes.string,
    onToggle: PropTypes.func
};

export default NameTableCell;
