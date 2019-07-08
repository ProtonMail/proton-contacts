import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { TableRow, Checkbox } from 'react-components';

import ImportFieldDropdown from './ImportFieldDropdown';
import ImportTypeDropdown from './ImportTypeDropdown';

const ImportCsvTableRow = ({ header, checked, property, value, onToggle, onChangeField, onChangeType }) => {
    const cells = [
        <Checkbox checked={checked} onChange={onToggle} />,
        header,
        !property ? (
            c('Info in import CSV modal').t`TODO`
        ) : (
            <div className="flex">
                <ImportFieldDropdown initialField={property.field} onChangeField={onChangeField} />
                {property.type ? (
                    <ImportTypeDropdown
                        field={property.field}
                        initialType={property.type}
                        onChangeType={onChangeType}
                    />
                ) : null}
            </div>
        ),
        value
    ];

    return <TableRow cells={cells} />;
};

ImportCsvTableRow.propTypes = {
    header: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    property: PropTypes.shape({ field: PropTypes.string, type: PropTypes.string }),
    value: PropTypes.string, // csv values are always strings
    onToggle: PropTypes.func,
    onChangeField: PropTypes.func,
    onChangeType: PropTypes.func
};

export default ImportCsvTableRow;
