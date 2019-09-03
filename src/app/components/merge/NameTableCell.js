import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, classnames } from 'react-components';

import { opaqueClassName } from '../../helpers/css';

<<<<<<< HEAD
const NameTableCell = ({ name, contactID, highlightedID, checked, deleted, greyedOut, onToggle }) => {
=======
const NameTableCell = ({ name, contactID, checked, deleted, greyedOut, onToggle }) => {
>>>>>>> refactor merge modal
    const handleToggle = () => onToggle(contactID);

    return (
        <div className="flex flex-nowrap flex-items-center">
            <Checkbox
                checked={checked}
                onChange={handleToggle}
                className={`flex flex-items-center flex-item-noshrink mr0-5 ${deleted ? 'nonvisible' : ''}`}
            />
            <span
                className={classnames([
                    'mw100',
                    'inbl',
                    'ellipsis',
                    opaqueClassName(greyedOut),
                    contactID === highlightedID && 'bold'
                ])}
            >
                {name}
            </span>
        </div>
    );
};

NameTableCell.propTypes = {
    contactID: PropTypes.string.isRequired,
<<<<<<< HEAD
    highlightedID: PropTypes.string,
=======
>>>>>>> refactor merge modal
    checked: PropTypes.bool,
    deleted: PropTypes.bool,
    greyedOut: PropTypes.bool,
    name: PropTypes.string,
    onToggle: PropTypes.func
};

export default NameTableCell;
