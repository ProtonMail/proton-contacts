import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';

// See './csv.js' for the definition of pre-vCard and pre-vCards contact

const { CLEAR_TEXT } = CONTACT_CARD_TYPE;

/**
 * For a list of vCard contacts, check if any contains categories
 * @param {Array<Array<Object>>} vcardContacts       Array of vCard contacts
 *
 * @return {Boolean}
 */
export const hasCategories = (vcardContacts) => {
    return vcardContacts.some((contact) => contact.some(({ field, value }) => value && field === 'categories'));
};

/**
 * Split encrypted contacts depending on having the CATEGORIES property.
 * @param {Array} obj.contacts      List of encrypted contacts. contact = { contact: { Cards }, index }
 *
 * @return {Object}                 { withCategories, withoutCategories, indexMapWith, indexMapWithout }
 */
export const splitContacts = (contacts = []) =>
    contacts.reduce(
        (acc, contact) => {
            const {
                contact: { Cards }
            } = contact;
            if (Cards.some(({ Type, Data }) => Type === CLEAR_TEXT && Data.includes('CATEGORIES'))) {
                acc.withCategories.push(contact);
            } else {
                acc.withoutCategories.push(contact);
            }
            return acc;
        },
        { withCategories: [], withoutCategories: [] }
    );
