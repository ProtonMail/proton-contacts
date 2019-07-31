import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useNotifications, Table, Alert, Block } from 'react-components';

import ImportCsvTableHeader from './ImportCsvTableHeader';
import ImportCsvTableBody from './ImportCsvTableBody';

import { prepare, toVcardContacts } from '../../helpers/csv';
import { modifyContactField, modifyContactType, toggleContactChecked } from '../../helpers/import';

const ImportCsvModalContent = ({ file, onSetVcardContacts }) => {
    const { createNotification } = useNotifications();

    const [isParsingFile, setIsParsingFile] = useState(true);
    const [contactIndex, setContactIndex] = useState(0);
    const [preVcardsContacts, setPreVcardsContacts] = useState([]);

    const handleClickPrevious = () => setContactIndex((index) => index - 1);
    const handleClickNext = () => setContactIndex((index) => index + 1);

    const handleToggle = (groupIndex) => (index) => {
        if (preVcardsContacts[0][groupIndex][index].combineInto === 'fn-main') {
            const preVcards = preVcardsContacts[0][groupIndex];
            const firstNameIndex = preVcards.findIndex(({ header }) => header.toLowerCase() === 'first name');
            const lastNameIndex = preVcards.findIndex(({ header }) => header.toLowerCase() === 'last name');
            const isFirstNameChecked = firstNameIndex !== -1 && preVcards[firstNameIndex].checked;
            const isLastNameChecked = lastNameIndex !== -1 && preVcards[lastNameIndex].checked;

            if ((!isFirstNameChecked && index === lastNameIndex) || (!isLastNameChecked && index === firstNameIndex)) {
                return createNotification({
                    type: 'error',
                    text: c('Error notification').t`First name and last name cannot be unchecked at the same time`
                });
            }
        }
        setPreVcardsContacts(preVcardsContacts.map((contact) => toggleContactChecked(contact, [groupIndex, index])));
    };

    const handleChangeField = (groupIndex) => (newField) =>
        setPreVcardsContacts(preVcardsContacts.map((contact) => modifyContactField(contact, groupIndex, newField)));

    const handleChangeType = (groupIndex) => (newType) =>
        setPreVcardsContacts(preVcardsContacts.map((contact) => modifyContactType(contact, groupIndex, newType)));

    useEffect(() => {
        const parseFile = async () => {
            const preVcardsContacts = prepare(file);
            console.log('prepared', preVcardsContacts);
            setPreVcardsContacts(preVcardsContacts);
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
