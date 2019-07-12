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
 * "pre-vCard property": Because different csv properties may correspond to a single vCard property,
 *                       to pass from one to the other we go through an intermediate step.
 *                       A pre-vCard property is the JS object:
 *                       { header, checked, pref, field, type, value, combineInto, combineIndex, combine }
 *                       The key "header" equals the csv property.
 *                       The key "checked" will mark whether we want to include this property into the vCard
 *                       The key "combineInto" will be the same for different csv properties that will
 *                       assemble into a single vCard property. For this assembly we need to order
 *                       the properties, which will be indicated by the key "combineIndex", and combine
 *                       them in a certain way indicated by the function "combine", which takes as arguments
 *                       the csv properties to be assembled
 * "pre-vCard contact": An array made of pre-vCard properties
 *
 * "pre-vCards property" An array of pre-vCard properties. These pre-Vcards are to be combined into a single vCard
 * "pre-vCards contact": An array made of arrays of pre-Vcard properties
 */

/**
 * Get all csv properties and corresponding contacts values from a csv file
 * @param {File} file
 * @return {Promise<Object>}         { headers: Array<String>, values: Array<Array<String>> }
 *
 * @dev  contacts[i][j] : value for property headers[j] of contact i
 */
const readCsv = (file) => {
    return new Promise((resolve, reject) => {
        const onComplete = ({ data = [] } = {}) => resolve({ headers: data[0], contacts: data.slice(1) });
        Papa.parse(file, {
            header: false,
            /*
                If true, the first row of parsed data will be interpreted as field names. An array of field names will be returned in meta,
                and each row of data will be an object of values keyed by field name instead of a simple array.
                Rows with a different number of fields from the header row will produce an error.
            */
            dynamicTyping: false, // If true, numeric and boolean data will be converted to their type instead of remaining strings.
            complete: onComplete,
            error: reject,
            skipEmptyLines: true // If true, lines that are completely empty will be skipped. An empty line is defined to be one which evaluates to empty string.
        });
    });
};

/**
 * For a list of headers and csv contacts extracted from a csv,
 * check if a given header index has the empty value for all contacts
 * @param {Number} index
 * @param {Array<Array<String>>} contacts
 *
 * @return {Boolean}
 */
const isEmptyHeaderIndex = (index, contacts) => !contacts.some((values) => values[index] !== '');

/**
 * Extract (only) non-empty csv properties and contacts values from a csv file
 * @param {File} file
 *
 * @return {Promise<Object>}         { headers: Array<String>, contacts: Array<Array<String>> }
 */
export const getCsvData = async (file) => {
    const { headers, contacts } = await readCsv(file);
    const indicesToKeep = headers.map((header, i) => !isEmptyHeaderIndex(i, contacts));
    return {
        headers: headers.filter((header, i) => indicesToKeep[i]),
        contacts: contacts.map((values) => values.filter((value, j) => indicesToKeep[j]))
    };
};

/**
 * Transform csv properties and csv contacts into pre-vCard contacts.
 * @param {Object} csvData
 * @param {Array<String>} csvData.headers           Array of csv properties
 * @param {Array<Array<String>>} csvData.contacts   Array of csv contacts
 *
 * @return {Array<Array<Object>>}                   pre-vCard contacts
 *
 * @dev  Some csv property may be assigned to several pre-vCard contacts,
 *       so an array of new headers is returned together with the pre-vCard contacts
 */
const parse = ({ headers = [], contacts = [] }) => {
    if (contacts.length === 0) {
        return [];
    }
    const translator = headers.map(toPreVcard);
    console.log(
        contacts.map((contact) =>
            contact.map((header, i) => translator[i](header)).reduce((acc, val) => acc.concat(val), [])
        )
        // some headers are mapped to several properties, so we need to flatten
    );
    return contacts
        .map((contact) =>
            contact
                .map((header, i) => translator[i](header))
                // some headers are mapped to several properties, so we need to flatten
                .reduce((acc, val) => acc.concat(val), [])
        )
        .map((contact) => contact.filter((preVcard) => !!preVcard));
};

/**
 * Transform csv properties and csv contacts into pre-vCard contacts,
 * re-arranging them in the process
 * @param {Object} csvData
 * @param {Array<String>} csvData.headers           Array of csv properties
 * @param {Array<Array<String>>} csvData.contacts   Array of csv contacts
 *
 * @return {Array<Object>}                          Array of pre-vCard contacts
 *
 * @dev  headers are arranged as headers = [[group of headers to be combined in a vCard], ...]
 *       preVcardContacts is an array of pre-vCard contacts, each of them containing pre-vCards
 *       arranged in the same way as the headers:
 *       preVcardContacts = [[[group of pre-vCard properties to be combined], ...], ...]
 */
export const prepare = ({ headers = [], contacts = [] }) => {
    const preVcardContacts = parse({ headers, contacts });
    if (!preVcardContacts.length) {
        return [];
    }

    // detect csv properties to be combined in preVcardContacts and split header indices
    const nonCombined = [];
    const combined = preVcardContacts[0].reduce((acc, { combineInto, combineIndex: j }, i) => {
        if (combineInto) {
            if (!acc[combineInto]) {
                acc[combineInto] = [];
            }
            acc[combineInto][j] = i;
            // combined will look like e.g.
            // { 'fn-main': [2, <empty item(s)>, 3, 5, 1], 'fn-yomi': [<empty item(s)>, 6, 7] }
            return acc;
        }
        nonCombined.push(i);
        return acc;
    }, {});

    for (const combination of Object.keys(combined)) {
        // remove empty items from arrays in combined
        combined[combination] = combined[combination].filter((n) => n !== null);
    }

    // re-order and arrange headers
    const preparedPreVcardContacts = contacts.map((contact) => []);
    for (const [i, indices] of Object.values(combined).entries()) {
        preparedPreVcardContacts.forEach((contact) => contact.push([]));
        indices.forEach((index) => {
            preparedPreVcardContacts.forEach((contact, k) =>
                contact[i].push({
                    ...preVcardContacts[k][index]
                })
            );
        });
    }
    for (const index of nonCombined) {
        preparedPreVcardContacts.forEach((contact, k) => contact.push([preVcardContacts[k][index]]));
    }

    return preparedPreVcardContacts;
};

const getFirst = (values) => values[0];

/**
 * Given a csv property name (header), return a function that transforms
 * a value for that property into one or several pre-vCard properties
 * @param {String} CsvProperty
 *
 * @return {Function}
 */
export const toPreVcard = (header) => {
    const property = header.toLowerCase();
    if (property === 'prefix' || property === 'title') {
        return (value) => [templateFN(header, value, 0), templateN(header, value, 3)];
    }
    if (property === 'first name') {
        return (value) => [templateFN(header, value, 1), templateN(header, value, 1)];
    }
    if (property === 'middle name') {
        return (value) => [templateFN(header, value, 2), templateN(header, value, 2)];
    }
    if (property === 'last name') {
        return (value) => [templateFN(header, value, 3), templateN(header, value, 0)];
    }
    if (property === 'suffix') {
        return (value) => [templateFN(header, value, 4), templateN(header, value, 4)];
    }
    if (property === 'given yomi') {
        return (value) => templateFNYomi(header, value, 0);
    }
    if (property === 'surname yomi') {
        return (value) => templateFNYomi(header, value, 1);
    }
    if (property === 'nickname') {
        return (value) => ({ header, value, check: true, field: 'nickname', combine: getFirst });
    }
    return (value) => null;
    // Brute-force all of them ?
};

const templateFN = (header, value, index) => ({
    header,
    value,
    checked: true,
    pref: 0,
    field: 'fn',
    type: 'Main',
    combineInto: 'fn-main',
    combineIndex: index,
    combine(values) {
        return values.join(' ');
    }
});
const templateFNYomi = (header, value, index) => ({
    header,
    value,
    checked: true,
    pref: 0,
    field: 'fn',
    type: 'Yomi',
    combineInto: 'fn-yomi',
    combineIndex: index,
    combine(values) {
        return values.join(' ');
    }
});
const templateN = (header, value, index) => ({
    header,
    value,
    checked: true,
    pref: 0,
    field: 'n',
    combineInto: 'n',
    combineIndex: index,
    combine(values) {
        return values.filter(Boolean).join('; ');
    }
});
