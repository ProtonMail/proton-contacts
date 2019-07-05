import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, Checkbox } from 'react-components';

const ImportCsvTableRow = ({ header, checked, value, onToggle, ...rest }) => {
    return <TableRow cells={[<Checkbox checked={checked} onChange={onToggle} />, header, 'field', value]} {...rest} />;
};

ImportCsvTableRow.propTypes = {
    header: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    value: PropTypes.string, // csv values are always strings
    onToggle: PropTypes.func
};

export default ImportCsvTableRow;
