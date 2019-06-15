import { normalize } from 'proton-shared/lib/helpers/string';
import { remove } from 'proton-shared/lib/helpers/array';

import { getEmails, getName } from './contact';

/**
 * Extract duplicate items.
 * @param {array} items
 * @param {string} duplicateKey
 * @param {string} uniqueKey
 * @param {string} objectKey
 * @returns {{}}
 */
export const extractDuplicates = ({ items = [], duplicateKey = '', uniqueKey = '', objectKey = '' }) => {
    const { cache, uniques } = items.reduce(
        (acc, item) => {
            const key = item[duplicateKey];
            const unique = item[uniqueKey];
            const object = item[objectKey];

            const { cache, uniques } = acc;

            // If this unique value has not been seen, initialize it.
            if (!uniques[unique]) {
                uniques[unique] = { potentialDuplicateKeys: [], used: false, object };
            }

            // If this unique value has already been used as a duplicate, continue.
            if (uniques[unique].used) {
                return acc;
            }

            // Previously unseen duplicate key.
            if (!cache[key]) {
                // Initialize it as a single array with the unique value.
                cache[key] = [unique];
                // Register that this unique value has a potential duplicate in these keys.
                uniques[unique].potentialDuplicateKeys.push(key);
            } else if (cache[key].indexOf(unique) === -1) {
                // Ensure that this unique value does not already exist in the duplicates.
                // A duplicate has been discovered.
                cache[key].push(unique);

                // Register that this unique value has been used.
                uniques[unique].used = true;

                // Ensure that all unique values registered as a duplicate for this key are used only once.
                cache[key].forEach((u) => {
                    // The unique value was used on this duplicate key, so free it up from all other potential duplicate keys.
                    uniques[u].potentialDuplicateKeys.forEach((k) => {
                        if (k !== key) {
                            cache[k] = remove(cache[k], u);
                        }
                    });
                    uniques[u].potentialDuplicateKeys.length = 0;
                });
            }
            return acc;
        },
        { cache: Object.create(null), uniques: Object.create(null) }
    );

    // For each duplicates found, convert the unique values to the desired object.
    return Object.keys(cache).reduce((acc, key) => {
        if (cache[key].length <= 1) {
            return acc;
        }
        acc[key] = cache[key].map((unique) => uniques[unique].object);
        return acc;
    }, Object.create(null));
};

/**
 * Extract duplicates from an array of contacts.
 * @param {Array} contacts
 * @returns {{}}
 */
export const extract = (contacts = []) => {
    // Flatten all emails and names from a contact into the format that duplicateExtractor expects.
    const items = contacts.reduce((acc, contact, index) => {
        getEmails(contact).forEach((email) => {
            acc.push({ duplicate: email, unique: index, contact });
        });
        acc.push({ duplicate: normalize(getName(contact)), unique: index, contact });
        return acc;
    }, []);
    // Extract the duplicates.
    return extractDuplicates({
        items,
        duplicateKey: 'duplicate',
        uniqueKey: 'unique',
        objectKey: 'contact'
    });
};
