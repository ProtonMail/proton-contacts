import React from 'react';
import PropTypes from 'prop-types';
import { DropdownCaret, classnames } from 'react-components';

const ContactGroupDropdownButton = ({ buttonRef, caretClassName = '', children, isOpen, ...rest }) => {
    return (
        <button type="button" role="button" ref={buttonRef} {...rest}>
            {children}
            <DropdownCaret
                isOpen={isOpen}
                className={classnames(['ml0-25 expand-caret mtauto mbauto', caretClassName])}
            />
        </button>
    );
};

ContactGroupDropdownButton.propTypes = {
    buttonRef: PropTypes.object,
    children: PropTypes.node,
    isOpen: PropTypes.bool,
    caretClassName: PropTypes.string
};

export default ContactGroupDropdownButton;
