import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-components';

import SelectImportField from './SelectImportField';
import SelectImportType from './SelectImportType';

import { toVcard } from '../../helpers/csv';

const ImportCsvTableRows = ({ preVcards, onToggle, onChangeField, onChangeType }) => {
    const { field, type, display } = toVcard(preVcards);

    if (field === 'n') {
        // Do not display N vcard field since it cannot be edited from the contact modal
        return null;
    }

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
                            <SelectImportField value={field} onChangeField={onChangeField} />
                            {type !== undefined ? (
                                <SelectImportType field={field} value={type} onChangeType={onChangeType} />
                            ) : null}
                        </div>
                    </td>
                    <td rowSpan={preVcards.length}>{display}</td>
                </>
            ) : null}
        </tr>
    ));
};

ImportCsvTableRows.propTypes = {
    preVcards: PropTypes.array.isRequired,
    onToggle: PropTypes.func,
    onChangeField: PropTypes.func,
    onChangeType: PropTypes.func
};

export default ImportCsvTableRows;
