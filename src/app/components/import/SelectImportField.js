import React from 'react';
import PropTypes from 'prop-types';
import { Label, Select } from 'react-components';

import { getFields } from '../../helpers/fields';

const SelectImportField = ({ value, onChangeField }) => {
    const fields = getFields();

    const handleChangeField = ({ target }) => onChangeField(target.value);

    return (
        <Label className="pt0">
            <Select value={value} options={fields} onChange={handleChangeField} />
        </Label>
    );
};

SelectImportField.propTypes = {
    value: PropTypes.string.isRequired,
    onChangeField: PropTypes.func
};

export default SelectImportField;
