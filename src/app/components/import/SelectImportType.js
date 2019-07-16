import React from 'react';
import PropTypes from 'prop-types';
import { Label, Select } from 'react-components';

import { getTypes } from '../../helpers/types';

const SelectImportType = ({ field, value, onChangeType }) => {
    const types = getTypes();

    const handleChangeType = ({ target }) => onChangeType(target.value);

    return (
        <Label className="pt0">
            <Select value={value} options={types[field]} onChange={handleChangeType} />
        </Label>
    );
};

SelectImportType.propTypes = {
    field: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChangeType: PropTypes.func
};

export default SelectImportType;
