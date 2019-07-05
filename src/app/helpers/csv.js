import Papa from 'papaparse';

/**
 * Get all csv properties (headers) and corresponding contacts values from a csv file
 * @param {File} file
 * @return {Promise<Object>}         { headers: Array<String>, values: Array<Array<String>> }
 *
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
 * Extract (only) non-empty csv properties and corresponding contacts values from a csv file
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
 * @param {Object} contacts
 * @param {Array<String>} contacts.headers          Array of property names for a list of csv contacts
 * @param {Array<Array<String>>} contacts.values    Array of contact values for the property names above
 * @return {Array<Array>}                           [[...contactProperties]]
 *
 * @dev  contacts[i][j] : value for property headers[j] of contact i
 */
export const parseCsvData = ({ headers = [], contacts = [] }) => {
    if (values.length === 0) {
        return [];
    }
    const properties = [];
    const translator = headers.map(toICALProperty);
    contacts.forEach((values) => properties.push(values.map((value, index) => translator[index](value))));
    return properties;
};

/**
 *
 * @param {String} CsvProperty
 * @return {Function}
 */
export const toICALProperty = (CsvProperty) => {
    const property = CsvProperty.toLowerCase();
    if (property === 'First Name') {
        return (value) => ({ field: 'fn', value });
    }
    // Brute-force all of them ?
};
