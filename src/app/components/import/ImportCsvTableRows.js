import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Checkbox } from 'react-components';

import ImportFieldDropdown from './ImportFieldDropdown';
import ImportTypeDropdown from './ImportTypeDropdown';

const ImportCsvTableRows = ({ preVcards, onToggle, onChangeField, onChangeType }) => {
    const { field, type, combine } = (preVcards.length && preVcards[0]) || {};
    const checkedValues = preVcards.map(({ checked, value }) => checked && value).filter(Boolean);

    return preVcards.map(({ checked, header }, i) => (
        <tr key={i.toString()}>
            <td className="aligncenter">
                <Checkbox checked={checked} onChange={() => onToggle(i)} />
            </td>
            <td>{header}</td>
            {i === 0 ? (
                <>
                    <td rowSpan={preVcards.length}>
                        <div className="flex">
                            <ImportFieldDropdown initialField={field} onChangeField={onChangeField} />
                            {type ? (
                                <ImportTypeDropdown field={field} initialType={type} onChangeType={onChangeType} />
                            ) : null}
                        </div>
                    </td>
                    <td rowSpan={preVcards.length}>{combine(checkedValues)}</td>
                </>
            ) : null}
        </tr>
    ));
};

ImportCsvTableRows.propTypes = {
    headers: PropTypes.array.isRequired,
    checked: PropTypes.array
};

export default ImportCsvTableRows;
