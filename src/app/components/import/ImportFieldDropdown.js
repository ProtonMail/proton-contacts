import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Dropdown, DropdownMenu, DropdownButton } from 'react-components';

import { CUSTOMIZABLE_VCARD_FIELDS as vcardFields, DISPLAY_VCARD_FIELDS as display } from '../../constants';

const ImportFieldDropdown = ({ initialField, onChangeField }) => {
    return (
        <Dropdown
            caret
            title={c('Info on dropdown in import CSV modal')
                .t`Select the VCF property that best matches the CSV property`}
            content={display[initialField]}
        >
            <DropdownMenu className="dropDown-contentInner">
                {vcardFields.map((field) => {
                    return (
                        <DropdownButton key={`field-${field}`} onClick={() => onChangeField(field)} type="button">
                            {display[field]}
                        </DropdownButton>
                    );
                })}
            </DropdownMenu>
        </Dropdown>
    );
};

ImportFieldDropdown.propTypes = {
    initialField: PropTypes.string.isRequired,
    onChangeField: PropTypes.func
};

export default ImportFieldDropdown;
