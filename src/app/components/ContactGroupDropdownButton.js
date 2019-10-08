import React from 'react';
import PropTypes from 'prop-types';
import { DropdownCaret } from 'react-components';

const ContactGroupDropdownButton = ({ buttonRef, children, isOpen, ...rest }) => {
    return (
        <button type="button" role="button" ref={buttonRef} {...rest}>
            {children}
            <DropdownCaret isOpen={isOpen} className="ml0-25 expand-caret mtauto mbauto" />
        </button>
    );
};

ContactGroupDropdownButton.propTypes = {
    buttonRef: PropTypes.object,
    children: PropTypes.node,
    isOpen: PropTypes.bool
};

export default ContactGroupDropdownButton;
