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
 * @param {Array} obj.contacts      List of encrypted contacts. contact = { Cards }
 * @param {Object} obj.indexMap     A map that points each contact index to another index
 *
 * @return {Object}                 { withCategories, withoutCategories, indexMapWith, indexMapWithout }
 */
export const splitContacts = ({ contacts = [], indexMap = {} }) =>
    contacts.reduce(
        (acc, { Cards }, i) => {
            const { withCategories, withoutCategories, indexMapWith, indexMapWithout } = acc;
            if (Cards.some(({ Type, Data }) => Type === CLEAR_TEXT && Data.includes('CATEGORIES'))) {
                indexMapWith[withCategories.length] = indexMap[i];
                withCategories.push({ Cards });
            } else {
                indexMapWithout[withoutCategories.length] = indexMap[i];
                withoutCategories.push({ Cards });
            }
            return acc;
        },
        {
            withCategories: [],
            withoutCategories: [],
            indexMapWith: Object.create(null),
            indexMapWithout: Object.create(null)
        }
    );

/**
 * Divide a list of contacts with an associated indexMap into batches of a certain size
 * @param {Array} obj.contacts      List of contacts
 * @param {Object} obj.indexMap     A map that points each contact index to another index
 * @param {Number} batchSize        Size of each batch
 *
 * @return {Object}
 */
export const divideInBatches = ({ contacts = [], indexMap = {} }, batchSize = 1) => {
    const { contactBatches, indexMapBatches } = contacts.reduce(
        (acc, contact, i) => {
            const { contactBatches, indexMapBatches } = acc;
            const iInBatch = i % batchSize;
            if (iInBatch === 0) {
                acc.index++;
                contactBatches.push([]);
                indexMapBatches.push({});
            }
            contactBatches[acc.index].push(contact);
            indexMapBatches[acc.index][iInBatch] = indexMap[i];
            return acc;
        },
        {
            contactBatches: [],
            indexMapBatches: [],
            index: -1
        }
    );

    return { contactBatches, indexMapBatches };
};

/**
 * Create a trivial index map for an array
 * @param {Array} collection
 */
export const trivialIndexMap = (collection) =>
    collection.reduce((acc, _item, i) => {
        acc[i] = i;
        return acc;
    }, Object.create(null));
