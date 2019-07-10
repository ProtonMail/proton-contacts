import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Checkbox } from 'react-components';

import ImportFieldDropdown from './ImportFieldDropdown';
import ImportTypeDropdown from './ImportTypeDropdown';

const ImportCsvTableRow = ({ header, checked, property, value, onToggle, onChangeField, onChangeType }) => {
    const cells = [
        { cell: <Checkbox checked={checked} onChange={onToggle} /> },
        { cell: header },
        {
            hide: property.hide,
            rowSpan: property.rowSpan,
            cell: !property ? (
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
            )
        },
        { cell: value }
    ];

    return (
        <tr>
            {cells.map(({ hide, rowSpan, cell }, index) =>
                hide ? null : (
                    <td key={index.toString()} rowSpan={rowSpan}>
                        {cell}
                    </td>
                )
            )}
        </tr>
    );
};

ImportCsvTableRow.propTypes = {
    header: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    property: PropTypes.shape({
        field: PropTypes.string,
        type: PropTypes.string,
        rowSpan: PropTypes.number,
        hide: PropTypes.bool
    }),
    value: PropTypes.string, // csv values are always strings
    onToggle: PropTypes.func,
    onChangeField: PropTypes.func,
    onChangeType: PropTypes.func
};

export default ImportCsvTableRow;
