import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Table, TableBody, Alert } from 'react-components';

import ImportCsvTableHeader from './ImportCsvTableHeader';
import ImportCsvTableRow from './ImportCsvTableRow';

import { getCsvData, parseCsvData } from '../../helpers/csv';

const ImportCsvModalContent = ({
    file,
    parsedContacts,
    propertiesToKeep,
    onChangeParsedContacts,
    onChangePropertiesToKeep,
    onToggleKeepProperty
}) => {
    const [isReadingFile, setIsReadingFile] = useState(true);
    const [headers, setHeaders] = useState([]);
    const [csvContacts, setCsvContacts] = useState([]);
    const [contactIndex, setContactIndex] = useState(0);

    const handleClickPrevious = () => setContactIndex((index) => index - 1);
    const handleClickNext = () => setContactIndex((index) => index + 1);

    const handleChangeField = (fieldToChange, newField) => {
        console.log('before', parsedContacts);
        console.log(
            'after',
            parsedContacts.map((contact) =>
                contact.map((prop) => (prop.field === fieldToChange ? { ...prop, field: newField } : prop))
            )
        );

        return onChangeParsedContacts((parsedContacts) =>
            parsedContacts.map((contact) =>
                contact.map((prop) => (prop.field === fieldToChange ? { ...prop, field: newField } : prop))
            )
        );
    };

    useEffect(() => {
        const readFile = async () => {
            const csvData = await getCsvData(file);
            setHeaders(csvData.headers);
            setCsvContacts(csvData.contacts);
            onChangeParsedContacts(parseCsvData({ headers: csvData.headers, contacts: csvData.contacts }));
            onChangePropertiesToKeep(csvData.headers.map((header) => true));
            setIsReadingFile(false);
        };

        readFile();
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
                            checked={propertiesToKeep[i]}
                            header={header}
                            property={parsedContacts[contactIndex] && parsedContacts[contactIndex][i]}
                            value={csvContacts[contactIndex] && csvContacts[contactIndex][i]}
                            onToggle={() => onToggleKeepProperty(i)}
                            onChangeField={handleChangeField}
                        />
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

ImportCsvModalContent.propTypes = {
    file: PropTypes.shape({ name: PropTypes.string, size: PropTypes.number }).isRequired,
    onChangeParsedContacts: PropTypes.func
};

export default ImportCsvModalContent;
