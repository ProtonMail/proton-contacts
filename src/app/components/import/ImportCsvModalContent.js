import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Table, TableBody, Alert } from 'react-components';

import ImportCsvTableHeader from './ImportCsvTableHeader';
import ImportCsvTableRow from './ImportCsvTableRow';

import { getCsvData, parseCsvData } from '../../helpers/csv';
import { modifyContactField, modifyContactType } from '../../helpers/import';

const ImportCsvModalContent = ({ file, parsedContacts, keepHeaders, onSetParsedContacts, onSetKeepHeaders }) => {
    const [isReadingFile, setIsReadingFile] = useState(true);
    const [contactIndex, setContactIndex] = useState(0);
    const [headers, setHeaders] = useState([]);
    const [csvContacts, setCsvContacts] = useState([]);

    const handleClickPrevious = () => setContactIndex((index) => index - 1);
    const handleClickNext = () => setContactIndex((index) => index + 1);

    const handleToggleKeepHeader = (index) => {
        onSetKeepHeaders((headers) => headers.map((bool, j) => (index === j ? !bool : bool)));
    };

    const handleChangeField = (fieldIndex) => (newField) =>
        onSetParsedContacts((parsedContacts) =>
            parsedContacts.map((contact) =>
                contact.map((property, i) => (fieldIndex === i ? modifyContactField(property, newField) : property))
            )
        );
    const handleChangeType = (fieldIndex) => (newType) =>
        onSetParsedContacts((parsedContacts) =>
            parsedContacts.map((contact) =>
                contact.map((property, i) => (fieldIndex === i ? modifyContactType(property, newType) : property))
            )
        );
    useEffect(() => {
        const parseFile = async () => {
            const csvData = await getCsvData(file);
            setHeaders(csvData.headers);
            setCsvContacts(csvData.contacts);
            onSetParsedContacts(parseCsvData({ headers: csvData.headers, contacts: csvData.contacts }));
            onSetKeepHeaders(csvData.headers.map((header) => true));
            setIsReadingFile(false);
        };

        parseFile();
    }, []);

    return (
        <>
            <Alert>
                {c('Description of the purpose of the import CSV modal')
                    .t`We have detected the following fields in the CSV file you uploaded. Check the ones you want to import.`}
            </Alert>
            <Alert>
                {c('Description of the purpose of the import CSV modal')
                    .t`Also, we have automatically matched CSV fields with vCard fields. You can review and change this matching manually.`}
            </Alert>
            <Table>
                <ImportCsvTableHeader
                    disabledPrevious={isReadingFile || contactIndex === 0}
                    disabledNext={isReadingFile || contactIndex + 1 === csvContacts.length}
                    onNext={handleClickNext}
                    onPrevious={handleClickPrevious}
                />
                <TableBody loading={isReadingFile} colSpan={4}>
                    {headers.map((header, i) => (
                        <ImportCsvTableRow
                            key={header}
                            checked={keepHeaders[i]}
                            header={header}
                            property={parsedContacts[contactIndex] && parsedContacts[contactIndex][i]}
                            value={csvContacts[contactIndex] && csvContacts[contactIndex][i]}
                            onToggle={() => handleToggleKeepHeader(i)}
                            onChangeField={handleChangeField(i)}
                            onChangeType={handleChangeType(i)}
                        />
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

ImportCsvModalContent.propTypes = {
    file: PropTypes.shape({ name: PropTypes.string, size: PropTypes.number }).isRequired,
    parsedContacts: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.shape({ field: PropTypes.string, type: PropTypes.string }))
    ),
    keepHeaders: PropTypes.arrayOf(PropTypes.bool),
    onSetParsedContacts: PropTypes.func,
    onSetKeepHeaders: PropTypes.func,
    onChangeParsedContacts: PropTypes.func
};

export default ImportCsvModalContent;
