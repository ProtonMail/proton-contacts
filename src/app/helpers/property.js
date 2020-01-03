import { getKeys, arrayToBinaryString, binaryStringToArray, decodeBase64, encodeBase64 } from 'pmcrypto';
import { PGP_SIGN, VCARD_KEY_FIELDS } from '../constants';
import { noop } from 'proton-shared/lib/helpers/function';
import { sortByPref } from './properties';

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
 * Returns true if a property has an empty value
 * @param {Object} property     { value, field, type, ... }
 * @return {Boolean}
 */
export const isEmptyValued = (property) => {
    const { value } = property;
    // property values must be strings or arrays of strings
    if (typeof value === 'string') {
        return !value;
    }
    if (Array.isArray(value)) {
        return !value.some((str) => str);
    }
    return true;
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

/**
 * Given an array of vCard properties, extract the keys and key-related fields
 * relevant for an email address
 * @param {Array} properties
 * @param {String} emailGroup       Group that characterizes the email address
 * @param {Number} defaultSign             Default sign value in case no other is specified in the vcard
 * @returns {Promise<{scheme: String, encrypt: Boolean, mimeType: String, pinnedKeys: Array}>}
 */
export const getKeysFromProperties = async (properties, emailGroup, defaultSign) => {
    const { pinnedKeyPromises, mimeType, encrypt, scheme, sign } = properties
        .filter(({ field, group }) => VCARD_KEY_FIELDS.includes(field) && group === emailGroup)
        .reduce(
            (acc, { field, value, pref }) => {
                if (field === 'key' && value) {
                    const [, base64 = ''] = value.split(',');
                    const key = binaryStringToArray(decodeBase64(base64));

                    if (key.length) {
                        const promise = getKeys(key)
                            .then(([publicKey]) => ({ publicKey, pref }))
                            .catch(noop);
                        acc.pinnedKeyPromises.push(promise);
                    }

                    return acc;
                }
                if (field === 'x-pm-encrypt' && value) {
                    acc.encrypt = value === 'true';
                    return acc;
                }
                if (field === 'x-pm-sign' && value) {
                    acc.sign = value === 'true';
                    return acc;
                }
                if (field === 'x-pm-scheme' && value) {
                    acc.scheme = value;
                    return acc;
                }
                if (field === 'x-pm-mimetype' && value) {
                    acc.mimeType = value;
                    return acc;
                }
                return acc;
            },
            { pinnedKeyPromises: [], mimeType: '', encrypt: false, scheme: '', sign: defaultSign === PGP_SIGN } // Default values
        );
    const pinnedKeys = (await Promise.all(pinnedKeyPromises))
        .filter(Boolean)
        .sort(sortByPref)
        .map(({ publicKey }) => publicKey);

    return { pinnedKeys, mimeType, encrypt, scheme, sign };
};

/**
 * Transform a key into a vCard property
 * @param {} publicKey      A PGP key
 * @param {String} group
 * @param {Number} index
 * @returns { field, pref, value, group }
 */
export const toKeyProperty = ({ publicKey, group, index }) => ({
    field: 'key',
    value: `data:application/pgp-keys;base64,${encodeBase64(arrayToBinaryString(publicKey.toPacketlist().write()))}`,
    group,
    pref: `${index + 1}` // order is important
});
