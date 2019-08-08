/**
 * ICAL library can crash if the value saved in the vCard is improperly formatted
 * If it crash we get the raw value from jCal key
 * @param {ICAL.Property} property
 *
 * @return {Array<String>}
 */
const getRawValues = (property) => {
    try {
        return property.getValues();
    } catch (error) {
        const [, , , value = ''] = property.jCal || [];
        return [value];
    }
};

/**
 * Get the value of an ICAL property
 * @param {ICAL.Property} property
 *
 * @return {String,Array}  currently an array for the field adr, a string otherwise
 */
export const getValue = (property) => {
    const [value] = getRawValues(property).map((val) => {
        // adr
        if (Array.isArray(val)) {
            return val;
        }

        if (typeof val === 'string') {
            return val;
        }

        // date
        return val.toString();
    });

    return value;
};

/**
 * Transform a custom type starting with 'x-' into normal type
 * @param {String} type
 *
 * @return {String}
 */
export const clearType = (type = '') => type.toLowerCase().replace('x-', '');

/**
 * Given types in an array, return the first type.
 * If types is a string already, return it
 * @param {String,Array} types
 *
 * @return {String}
 */
export const getType = (types = []) => {
    if (Array.isArray(types)) {
        if (!types.length) {
            return '';
        }
        return types[0];
    }
    return types;
};

/**
 * Transform an array value for the field 'adr' into a string to be displayed
 * @param {Array} adr
 *
 * @return {String}
 */
export const formatAdr = (adr = []) => {
    return adr
        .filter(Boolean)
        .map((value) => value.trim())
        .join(', ');
};
