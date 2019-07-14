import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Dropdown, DropdownMenu, DropdownButton } from 'react-components';

import { CUSTOMIZABLE_VCARD_TYPES as vcardTypes, DISPLAY_VCARD_TYPES as display } from '../../constants';

const ImportTypeDropdown = ({ field, initialType, onChangeType }) => {
    return (
        <Dropdown
            caret
            title={c('Info on dropdown in import CSV modal').t`Select a type for the VCF property`}
            content={display[initialType]}
        >
            <DropdownMenu className="dropDown-contentInner">
                {vcardTypes[field].map((type) => (
                    <DropdownButton key={`type-${type}`} onClick={() => onChangeType(type)} type="button">
                        {display[type]}
                    </DropdownButton>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
};

ImportTypeDropdown.propTypes = {
    field: PropTypes.string.isRequired,
    initialType: PropTypes.string.isRequired,
    onChangeType: PropTypes.func
};

export default ImportTypeDropdown;
