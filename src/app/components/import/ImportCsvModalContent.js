import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Table, Alert, Block } from 'react-components';

import ImportCsvTableHeader from './ImportCsvTableHeader';
import ImportCsvTableBody from './ImportCsvTableBody';

import { getCsvData, prepare } from '../../helpers/csv';
import { modifyContactField, modifyContactType, toggleContactChecked } from '../../helpers/import';

const ImportCsvModalContent = ({ file, parsedContacts, onSetParsedContacts }) => {
    const [isReadingFile, setIsReadingFile] = useState(true);
    const [contactIndex, setContactIndex] = useState(0);
    const [preVcardsContacts, setpreVcardsContacts] = useState([]);

    const handleClickPrevious = () => setContactIndex((index) => index - 1);
    const handleClickNext = () => setContactIndex((index) => index + 1);

    const handleToggle = (groupIndex) => (index) =>
        setpreVcardsContacts(preVcardsContacts.map((contact) => toggleContactChecked(contact, [groupIndex, index])));

    const handleChangeField = (groupIndex) => (newField) =>
        setpreVcardsContacts(preVcardsContacts.map((contact) => modifyContactField(contact, groupIndex, newField)));

    const handleChangeType = (groupIndex) => (newType) =>
        setpreVcardsContacts(preVcardsContacts.map((contact) => modifyContactType(contact, groupIndex, newType)));

    useEffect(() => {
        const parseFile = async () => {
            const preVcardsContacts = prepare(await getCsvData(file));
            setpreVcardsContacts(preVcardsContacts);
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
                    disabledNext={isReadingFile || contactIndex + 1 === preVcardsContacts.length}
                    onNext={handleClickNext}
                    onPrevious={handleClickPrevious}
                />
                <ImportCsvTableBody
                    loading={isReadingFile}
                    contact={preVcardsContacts && preVcardsContacts[contactIndex]}
                    onToggle={handleToggle}
                    onChangeField={handleChangeField}
                    onChangeType={handleChangeType}
                />
            </Table>
            {!isReadingFile && !preVcardsContacts.length && (
                <Block className="aligncenter">{c('Info').t`No contacts to be imported`}</Block>
            )}
        </>
    );
};

ImportCsvModalContent.propTypes = {
    file: PropTypes.shape({ name: PropTypes.string, size: PropTypes.number }).isRequired,
    parsedContacts: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.shape({ field: PropTypes.string, type: PropTypes.string }))
    ),
    onSetParsedContacts: PropTypes.func
};

export default ImportCsvModalContent;
