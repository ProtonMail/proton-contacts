import React, { ChangeEvent } from 'react';
import { Label, Select } from 'react-components';

import { getAllTypes } from '../../helpers/types';

interface Props {
    field?: string;
    value: string;
    onChangeType: (type: string) => void;
}
const SelectImportType = ({ field = '', value, onChangeType }: Props) => {
    const types = getAllTypes();

    const handleChangeType = ({ target }: ChangeEvent<HTMLSelectElement>) => onChangeType(target.value);

    return (
        <Label className="pt0">
            <Select value={value} options={types[field]} onChange={handleChangeType} />
        </Label>
    );
};

export default SelectImportType;
