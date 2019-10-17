import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-components';

const ItemCheckbox = ({ children, onClick, ...rest }) => {
    return (
        <label onClick={onClick}>
            <input type="checkbox" className="item-checkbox sr-only" {...rest} />
            <span className="item-icon flex-item-noshrink rounded50 bg-white inline-flex">
                <span className="mauto item-abbr">{children}</span>
                <span className="item-icon-fakecheck mauto">
                    <Icon name="on" className="item-icon-fakecheck-icon" />
                </span>
            </span>
        </label>
    );
};

ItemCheckbox.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node
};

export default ItemCheckbox;
