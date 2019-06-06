import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-components';
import { c } from 'ttag';

const ContactGroupDropdown = ({ className }) => {
    return (
        <Dropdown caret className={className} content={c('Contact group dropdown').t`Group`}>
            test
        </Dropdown>
    );
};

ContactGroupDropdown.propTypes = {
    className: PropTypes.string
};

export default ContactGroupDropdown;
