import Papa from 'papaparse';

/**
 * Extract "CSV contacts" from a csv file
 * @param {File} file
 * @return {Object}         { csvProperties: Array<String>, values: Array<String> }
 */
export const extractCsvContacts = (file) => {
    return new Promise((resolve, reject) => {
        const onComplete = ({ data = [] } = {}) => resolve({ csvProperties: data[0], values: data.slice(1) });
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
 * @param {Array<String>} contacts.csvProperties    Array of property names for a list of csv contacts
 * @param {Array<String>} contacts.values           Array of contact values for the property names above
 * @return {Array<Array>}                           [[...contactProperties]]
 *
 * @dev  values[i][j] : value for property csvProperties[j] of contact i
 */
export const parseCsvContacts = ({ csvProperties = [], values = [] }) => {
    if (values.length === 0) {
        return [];
    }
    const properties = [];
    const translator = csvProperties.map(toICALProperty);
    values.forEach((contactValues) => properties.push(contactValues.map((value, index) => translator[index](value))));
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
