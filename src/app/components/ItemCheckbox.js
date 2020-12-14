import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-components';

const ItemCheckbox = ({ children, onClick, ...rest }) => {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/label-has-associated-control,jsx-a11y/no-noninteractive-element-interactions
        <label className="item-checkbox-label relative" onClick={onClick}>
            <input type="checkbox" className="item-checkbox inner-ratio-container cursor-pointer m0" {...rest} />
            <span className="item-icon flex-item-noshrink rounded bg-white inline-flex">
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
    children: PropTypes.node,
};

export default ItemCheckbox;
