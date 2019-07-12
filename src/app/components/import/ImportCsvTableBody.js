import React from 'react';
import PropTypes from 'prop-types';
import { TableRowBusy } from 'react-components';

import ImportCsvTableRows from './ImportCsvTableRows';

const ImportCsvTableBody = ({ loading, contact, onToggle, onChangeField, onChangeType }) => {
    return (
        <tbody>
            {loading ? (
                <TableRowBusy colSpan={4} />
            ) : (
                contact &&
                contact.map((preVcards, i) => (
                    <ImportCsvTableRows
                        key={i.toString()}
                        preVcards={preVcards}
                        onToggle={onToggle(i)}
                        onChangeField={onChangeField(i)}
                        onChangeType={onChangeType(i)}
                    />
                ))
            )}
        </tbody>
    );
};

ImportCsvTableBody.propTypes = {
    loading: PropTypes.bool,
    contact: PropTypes.array,
    onToggle: PropTypes.func,
    onChangeField: PropTypes.func,
    onChangeType: PropTypes.func
};

ImportCsvTableBody.defaultPropTypes = {
    disabledPrevious: true,
    disabledNext: true
};

export default ImportCsvTableBody;
