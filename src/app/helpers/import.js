// See './csv.js' for the definition of pre-vCard and pre-vCards contact

/**
 * For a list of vCard contacts, check if any contains categories
 * @param {Array<Array<Object>>} vcardContacts       Array of vCard contacts
 *
 * @return {Boolean}
 */
export const hasCategories = (vcardContacts) => {
    return vcardContacts.some((contact) => contact.some(({ field, value }) => value && field === 'categories'));
};
