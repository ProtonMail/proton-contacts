import Papa from 'papaparse';
import { prepareContact } from './decrypt';

/** NOTATION
 *
 * Because the words 'property' and 'contact' are used several times in this file with different
 * meanings depending on the context, let us establish here those context meanings.
 *
 * "csv property": The first row of a csv file is made of several headers.
 *                 We call them csv properties.
 *                 E.g. 'First Name', 'Last Name', 'Email 2 Address'
 *
 * "csv contact": Each row of a csv file (except for the first one) is made of string values
 *                that correspond to the property in the header. We call the array made of
 *                these values a csv contact.
 *                E.g. ['john', 'doe', 'john.doe@microsoft.com', ...]
 *
 * "csv contact value": Each of the string values inside a csv contact
 *
 * "vCard property": A format we are using for vCard properties in the file './vcard.js'.
 *                   Namely a vCard property is the JS object:
 *                   { pref, field, group, type, value }
 *
 * "vCard contact": An array made of vCard properties
 *
 * "pre-vCard property": Because different csv properties correspond to a single vCard property,
 *                       to pass from one to the other we go through an intermediate step.
 *                       A pre-vCard property is the JS object:
 *                       { pref, field, group, type, value, group, inGroup }
 *                       The key "group" will be the same for different csv properties that will
 *                       assemble into a single vCard property. For this assembly we need to order
 *                       the properties, and that order will be indicated by the key "inGroup"
 * "pre-vCard contact": An array made of pre-vCard properties
 */

/**
 * Get all csv properties and corresponding contacts values from a csv file
 * @param {File} file
 * @return {Promise<Object>}         { headers: Array<String>, values: Array<Array<String>> }
 *
 * @dev  headers are automatically converted into lower case
 * @dev  contacts[i][j] : value for property headers[j] of contact i
 */
const readCsv = (file) => {
    return new Promise((resolve, reject) => {
        const onComplete = ({ data = [] } = {}) => resolve({ headers: data[0], contacts: data.slice(1) });
        Papa.parse(file, {
            header: false, // If true, the first row of parsed data will be interpreted as field names. An array of field names will be returned in meta, and each row of data will be an object of values keyed by field name instead of a simple array. Rows with a different number of fields from the header row will produce an error.
            dynamicTyping: false, // If true, numeric and boolean data will be converted to their type instead of remaining strings.
            complete: onComplete,
            error: reject,
            skipEmptyLines: true // If true, lines that are completely empty will be skipped. An empty line is defined to be one which evaluates to empty string.
        });
    });
};

/**
 * For a list of headers and contacts values extracted from a csv,
 * check if a given header index has the empty value for all contacts
 * @param {Number} index
 * @param {Array<Array<String>>} contacts
 * @return {Boolean}
 */
const isEmptyHeaderIndex = (index, contacts) => {
    return contacts.some((values) => values[index] !== '');
};

/**
 * Extract (only) non-empty csv properties and contacts values from a csv file
 * @param {File} file
 * @return {Promise<Object>}         { headers: Array<String>, contacts: Array<Array<String>> }
 *
 * @dev  contacts[i][j] : value for property headers[j] of contact i
 */
export const getCsvData = async (file) => {
    const { headers, contacts } = await readCsv(file);
    const indicesToRemove = headers.map((header, i) => isEmptyHeaderIndex(i, contacts));
    return {
        headers: headers.filter((header, i) => indicesToRemove[i]),
        contacts: contacts.map((values) => values.filter((value, j) => indicesToRemove[j]))
    };
};

/**
 * Transform prepared csv properties and csv contacts into pre-vCard contacts
 * @param {Object} csvData
 * @param {Array<String>} csvData.headers           Array of prepared csv properties
 * @param {Array<Array<String>>} csvData.contacts   Array of csv contacts
 * @return {Array<Array<Object>>}                   Array of pre-vCard contacts
 *
 * @dev  contacts[i][j] : value for property headers[j] of contact i
 */
const preParseCsvData = ({ headers = [], contacts = [] }) => {
    if (contacts.length === 0) {
        return [];
    }
    const translator = headers.map(toICALPreProperty);
    return contacts
        .map((values) => values.map((value, index) => translator[index](value)))
        .map((properties) => properties.filter((property) => !!property));
};

/**
 * Transform prepared csv properties and csv contacts into vCard contacts
 * @param {Object} csvData
 * @param {Array<String>} csvData.headers           Array of prepared csv properties
 * @param {Array<Array<String>>} csvData.contacts   Array of csv contacts
 * @return {Array<Array<Object>>}                   { headers, preVcardContacts }
 *
 * @dev  contacts[i][j] : value for property headers[j] of contact i
 */
export const prepareCsvData = ({ headers = [], contacts = [] }) => {
    const preVcardContacts = preParseCsvData({ headers, contacts });
    if (!preVcardContacts.length) {
        return { headers: [], preVcardContacts: [] };
    }

    // detect groups in preVcardContacts and split header indices
    const unGroupedIndices = [];
    const groups = preVcardContacts[0].reduce((acc, { group, inGroup }, i) => {
        if (group) {
            if (!acc[group]) {
                acc[group] = [];
            }
            // groups = { 'fn-main': [2, 3, 5, 1], 'fn-yomi': [6, 7] }
            acc[group][inGroup] = i;
            return acc;
        }
        unGroupedIndices.push(i);
        return acc;
    }, {});
    for (const group of Object.keys(groups)) {
        groups[group] = groups[group].filter((n) => n !== null);
    }

    // re-order headers
    const reOrderedHeaders = [];
    const reOrderedContacts = contacts.map((contact) => []);
    for (const [key, groupIndices] of Object.entries(groups)) {
        for (const [j, index] of groupIndices.entries()) {
            reOrderedHeaders.push(headers[index]);
            reOrderedContacts.forEach((contact, i) =>
                contact.push({
                    ...preVcardContacts[i][index],
                    rowSpan: j === 0 ? groupIndices.length : undefined,
                    hide: j !== 0
                })
            );
        }
    }
    for (const index of unGroupedIndices) {
        reOrderedHeaders.push(headers[index]);
        reOrderedContacts.forEach((contact, i) => contact.push(preVcardContacts[i][index]));
    }

    return { headers: reOrderedHeaders, preVcardContacts: reOrderedContacts };
};

/**
 * Given a csv property name, return a function that transforms
 * a value for that property into a pre-vCard property
 * @param {String} CsvProperty
 * @return {Function}
 */
export const toICALPreProperty = (CsvProperty) => {
    const property = CsvProperty.toLowerCase();
    if (property === 'prefix' || property === 'title') {
        return (value) => ({ field: 'fn', value, group: 'fn-main', inGroup: 0 });
    }
    if (property === 'first name') {
        return (value) => ({ field: 'fn', value, group: 'fn-main', inGroup: 1 });
    }
    if (property === 'middle name') {
        return (value) => ({ field: 'n', value, group: 'fn-main', inGroup: 2 });
    }
    if (property === 'last name') {
        return (value) => ({ field: 'fn', value, group: 'fn-main', inGroup: 3 });
    }
    if (property === 'suffix') {
        return (value) => ({ field: 'fn', value, group: 'fn-main', inGroup: 4 });
    }
    if (property === 'nickname') {
        return (value) => ({ field: 'nickname', value });
    }
    return (value) => null;
    // Brute-force all of them ?
};
