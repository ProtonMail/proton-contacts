import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';

// See './csv.js' for the definition of pre-vCard and pre-vCards contact

const { CLEAR_TEXT } = CONTACT_CARD_TYPE;

/**
 * Split encrypted contacts depending on having the CATEGORIES property.
 * @param {Array} obj.contacts      List of encrypted contacts. contact = { contact: { Cards }, index }
 *
 * @return {Object}                 { withCategories, withoutCategories }
 */
export const splitContacts = (contacts = []) =>
    contacts.reduce(
        (acc, contact) => {
            const {
                contact: { Cards, error }
            } = contact;
            if (error) {
                return acc;
            }
            if (Cards.some(({ Type, Data }) => Type === CLEAR_TEXT && Data.includes('CATEGORIES'))) {
                acc.withCategories.push(contact);
            } else {
                acc.withoutCategories.push(contact);
            }
            return acc;
        },
        { withCategories: [], withoutCategories: [] }
    );
