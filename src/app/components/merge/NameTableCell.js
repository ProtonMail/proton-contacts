import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, classnames } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

const NameTableCell = ({ name, contactID, index, checked, deleted, greyedOut, onToggle }) => {
    const handleToggle = () => onToggle(contactID);

    return (
        <div className="flex flex-nowrap flex-items-center">
            <Checkbox
                checked={checked}
                onChange={handleToggle}
                className={`flex flex-items-center mr0-5 ${deleted ? 'nonvisible' : ''}`}
            />
            <span
                className={classnames(['mw100', 'inbl', 'ellipsis', opaqueClassName(greyedOut), index === 0 && 'bold'])}
            >
                {name}
            </span>
        </div>
    );
};

NameTableCell.propTypes = {
    contactID: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    checked: PropTypes.bool,
    deleted: PropTypes.bool,
    greyedOut: PropTypes.bool,
    name: PropTypes.string,
    onToggle: PropTypes.func
};

export default NameTableCell;
