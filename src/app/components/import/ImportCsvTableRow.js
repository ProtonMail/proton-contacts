import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { TableRow, Checkbox, Dropdown, DropdownMenu, DropdownButton } from 'react-components';

import { CUSTOMIZABLE_VCARD_FIELDS as vcardFields, CUSTOMIZABLE_VCARD_TYPES as vcardTypes } from '../../constants';

const ImportCsvTableRow = ({ header, checked, property, value, onToggle, onChangeField, ...rest }) => {
    console.log(property);
    const [prop, set] = useState(property);

    const handleChangeField = (fieldToChange, newField) => {
        set((prop) => ({ ...prop, field: newField }));
        onChangeField(fieldToChange, newField);
    };

    const cells = [
        <Checkbox checked={checked} onChange={onToggle} />,
        header,
        !property ? (
            c('Info in import CSV modal').t`TODO`
        ) : (
            <div className="flex">
                <Dropdown
                    caret
                    title={c('Info on dropdown in import CSV modal')
                        .t`Select the VCF property that best matches the CSV property`}
                    content={prop.field}
                >
                    <DropdownMenu className="dropDown-contentInner">
                        {vcardFields.map((field) => {
                            return (
                                <DropdownButton
                                    key={`field-${field}`}
                                    onClick={() => handleChangeField(property.field, field)}
                                >
                                    {field}
                                </DropdownButton>
                            );
                        })}
                    </DropdownMenu>
                </Dropdown>
                {prop.type && prop.type.length ? (
                    <Dropdown
                        caret
                        title={c('Info on dropdown in import CSV modal').t`Select a type for the VCF property`}
                        content={prop.type}
                    >
                        <DropdownMenu className="dropDown-contentInner">
                            {vcardTypes[prop.field].map((type) => (
                                <DropdownButton key={`type-${type}`}>{type}</DropdownButton>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                ) : null}
            </div>
        ),
        value
    ];

    useEffect(() => {
        return () => console.log('unmounted', prop);
    }, []);

    return <TableRow cells={cells} {...rest} />;
};

ImportCsvTableRow.propTypes = {
    header: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    value: PropTypes.string, // csv values are always strings
    onToggle: PropTypes.func
};

export default ImportCsvTableRow;
