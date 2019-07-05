import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Table, TableBody, Alert } from 'react-components';

import ImportCsvTableHeader from './ImportCsvTableHeader';
import ImportCsvTableRow from './ImportCsvTableRow';

import { getCsvData } from '../../helpers/csv';

const ImportCsvModalContent = ({ file, onChangeProperties }) => {
    const [isReadingFile, setIsReadingFile] = useState(true);
    const [headers, setHeaders] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [contactIndex, setContactIndex] = useState(0);

    const [contactsProperties, setProperties] = useState([]);

    const handleClickPrevious = () => setContactIndex((index) => index - 1);
    const handleClickNext = () => setContactIndex((index) => index + 1);

    useEffect(() => {
        const readFile = async () => {
            const csvData = await getCsvData(file);
            setHeaders(csvData.headers);
            setContacts(csvData.contacts);
            // setProperties(parseCsvData({ headers: csvData.headers, contacts: csvData.contacts }));
            setIsReadingFile(false);
        };

        readFile();
    }, []);

    return (
        <>
            <Alert>
                {c('Description')
                    .t`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`}
            </Alert>
            <Table>
                <ImportCsvTableHeader
                    disabledPrevious={isReadingFile || contactIndex === 0}
                    disabledNext={isReadingFile || contactIndex + 1 === contacts.length}
                    onNext={handleClickNext}
                    onPrevious={handleClickPrevious}
                />
                <TableBody loading={isReadingFile} colSpan={4}>
                    {headers.map((header, i) => (
                        <ImportCsvTableRow
                            key={header}
                            header={header}
                            checked={true}
                            value={contacts[contactIndex] && contacts[contactIndex][i]}
                        />
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

ImportCsvModalContent.propTypes = {
    file: PropTypes.shape({ name: PropTypes.string, size: PropTypes.number }).isRequired,
    onChangeProperties: PropTypes.func
};

export default ImportCsvModalContent;
