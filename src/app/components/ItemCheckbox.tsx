import React, { InputHTMLAttributes, ReactNode, MouseEvent } from 'react';
import { Icon } from 'react-components';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    onClick: (event: MouseEvent) => void;
    children: ReactNode;
}

const ItemCheckbox = ({ children, onClick, ...rest }: Props) => {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/label-has-associated-control,jsx-a11y/no-noninteractive-element-interactions
        <label className="item-checkbox-label relative" onClick={onClick}>
            <input type="checkbox" className="item-checkbox inner-ratio-container cursor-pointer m0" {...rest} />
            <span className="item-icon flex-item-noshrink rounded inline-flex">
                <span className="mauto item-abbr">{children}</span>
                <span className="item-icon-fakecheck mauto">
                    <Icon name="on" className="item-icon-fakecheck-icon" />
                </span>
            </span>
        </label>
    );
};

export default ItemCheckbox;
