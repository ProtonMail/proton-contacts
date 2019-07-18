import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Table, Alert, Block } from 'react-components';

import ImportCsvTableHeader from './ImportCsvTableHeader';
import ImportCsvTableBody from './ImportCsvTableBody';

import { prepare, toVcardContacts } from '../../helpers/csv';
import { modifyContactField, modifyContactType, toggleContactChecked } from '../../helpers/import';

const ImportCsvModalContent = ({ file, onSetVcardContacts }) => {
    const [isParsingFile, setIsParsingFile] = useState(true);
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
            const preVcardsContacts = prepare(file);
            setpreVcardsContacts(preVcardsContacts);
            setIsParsingFile(false);
        };

        parseFile();
    }, []);

    useEffect(() => {
        onSetVcardContacts(toVcardContacts(preVcardsContacts));
    }, [preVcardsContacts]);

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
                    disabledPrevious={isParsingFile || contactIndex === 0}
                    disabledNext={
                        isParsingFile || preVcardsContacts.length === 0 || contactIndex + 1 === preVcardsContacts.length
                    }
                    onNext={handleClickNext}
                    onPrevious={handleClickPrevious}
                />
                <ImportCsvTableBody
                    loading={isParsingFile}
                    contact={preVcardsContacts && preVcardsContacts[contactIndex]}
                    onToggle={handleToggle}
                    onChangeField={handleChangeField}
                    onChangeType={handleChangeType}
                />
            </Table>
            {!isParsingFile && !preVcardsContacts.length && (
                <Block className="aligncenter">{c('Info').t`No contacts to be imported`}</Block>
            )}
        </>
    );
};

ImportCsvModalContent.propTypes = {
    file: PropTypes.shape({ headers: PropTypes.array, contacts: PropTypes.array }).isRequired,
    parsedContacts: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.shape({ field: PropTypes.string, type: PropTypes.string }))
    ),
    onSetParsedContacts: PropTypes.func
};

export default ImportCsvModalContent;