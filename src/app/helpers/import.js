import { getTypeValues } from '../helpers/types';

// See './csv.js' for the definition of pre-vCard and pre-vCards contact

/**
 * Modify the field (and accordingly the type, if needed) of a pre-vCard
 * @param {Object} preVcard         A pre-vCard: { field, type, ... }
 * @param {String} newField         The new field
 *
 * @return {Object}                 pre-vCard with the modified field (and type, if needed)
 */
const modifyPreVcardField = (preVcard, newField) => {
    const types = getTypeValues();
    const newType = types[newField].includes(preVcard.type)
        ? preVcard.type
        : types[newField].length
        ? types[newField][0]
        : undefined;
    return { ...preVcard, field: newField, type: newType };
};

/**
 * Modify the field (and accordingly the type) of a pre-vCard inside a pre-vCards contact
 * @param {Object} preVcardsContact     A pre-vCards contact
 * @param {Number} index                Index of the group of pre-vCards for which the field will be modified
 * @param {String} newField             The new field
 *
 * @return {Array<Array<Object>>}       the pre-vCards contact with the modified pre-vCard
 */
export const modifyContactField = (preVcardsContact, index, newField) => {
    return preVcardsContact.map((preVcards, i) =>
        i !== index ? preVcards : preVcards.map((preVcard) => modifyPreVcardField(preVcard, newField))
    );
};

/**
 * Modify the type of a pre-vCard
 * @param {Object} preVcard         A pre-vCard: { type, ... }
 * @param {String} newType          The new type
 *
 * @return {Object}                 pre-vCard with the modified type
 */
const modifyPreVcardType = (preVcard, newType) => ({ ...preVcard, type: newType });

/**
 * Modify the type of a pre-vCard inside a pre-vCards contact
 * @param {Object} preVcardsContact     A pre-vCards contact
 * @param {Number} index                Index of the group of pre-vCards for which the type will be modified
 * @param {String} newField             The new type
 *
 * @return {Array<Array<Object>>}       the pre-vCards contact with the modified pre-vCard
 */
export const modifyContactType = (preVcardsContact, index, newField) => {
    return preVcardsContact.map((preVcards, i) =>
        i !== index ? preVcards : preVcards.map((preVcard) => modifyPreVcardType(preVcard, newField))
    );
};

/**
 * Toggle the checked attribute of a pre-vCard inside a pre-vCards contact
 * @param {Object} preVcardsContact     A pre-vCards contact
 * @param {Number} groupIndex           The index of the group of pre-Vcards where the pre-vCard to be modified is
 * @param {Number} index                The index of the pre-vCard within the group of pre-vCards
 *
 * @return {Array<Array<Object>>}       the pre-vCards contact with the modified pre-vCard
 */
export const toggleContactChecked = (preVcardsContact, [groupIndex, index]) => {
    return preVcardsContact.map((preVcards, i) =>
        i !== groupIndex
            ? preVcards
            : preVcards.map((preVcard, j) => (j !== index ? preVcard : { ...preVcard, checked: !preVcard.checked }))
    );
};
