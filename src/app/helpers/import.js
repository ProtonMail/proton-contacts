import { CUSTOMIZABLE_VCARD_TYPES as vcardTypes } from '../constants';

/**
 * Modify the field (and accordingly the type) of a contact property
 * @param {Object} property         A contact property: { pref, field, group, type, value }
 * @param {String} newField         The new field
 */
export const modifyContactField = (property, newField) => {
    const newType = vcardTypes[newField].includes(property.type) ? property.type : vcardTypes[newField][0];
    return { ...property, field: newField, type: newType };
};

/**
 * Modify the type of a contact property
 * @param {Object} property         A contact property: { pref, field, group, type, value }
 * @param {String} newType          The new type
 */
export const modifyContactType = (property, newType) => ({ ...property, type: newType });
