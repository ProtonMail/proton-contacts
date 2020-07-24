import React, { ChangeEvent } from 'react';
import { Label, Select } from 'react-components';

import { getAllFields } from '../../helpers/fields';

interface Props {
    value?: string;
    onChangeField: (field: string) => void;
}
const SelectImportField = ({ value = '', onChangeField }: Props) => {
    const fields = getAllFields();

    const handleChangeField = ({ target }: ChangeEvent<HTMLSelectElement>) => onChangeField(target.value);

    return (
        <Label className="pt0">
            <Select value={value} options={fields} onChange={handleChangeField} />
        </Label>
    );
};

export default SelectImportField;
