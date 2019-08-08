import { normalize } from 'proton-shared/lib/helpers/string';

import { ONE_OR_MORE_MUST_BE_PRESENT, ONE_OR_MORE_MAY_BE_PRESENT, PROPERTIES, isCustomField } from './vcard';
import { generateNewGroupName } from './properties';
import { unique } from 'proton-shared/lib/helpers/array';

/**
 * Given an array of object keys and and object storing indices,
 * if the object contains any of these keys, return the index stored in the object
 * for the first of such keys. Otherwise return -1
 * @param {Array} keys
 * @param {Object} obj
 *
 * @return {Number}
 */
const findKeyIndex = (keys, obj) => {
    for (const key of keys) {
        if (obj[key] !== undefined) {
            return obj[key];
        }
    }
    return -1;
};

/**
 * Given a list of connections (a "connection" is a list of keys [key1, key2, ...] connected for some reason),
 * find recursively all connections and return a new list of connections with no key repeated.
 * E.g.: [[1, 2, 3], [3, 5], [4, 6]] ->  [[1, 2, 3, 5], [4, 6]]
 * @param {Array} connections
 *
 * @return {Array}
 */
export const linkConnections = (connections) => {
    let didModify = false;

    const { newConnections } = connections.reduce(
        (acc, connection, i) => {
            const { connected, newConnections } = acc;
            const indexFound = findKeyIndex(connection, connected);

            if (indexFound !== -1) {
                newConnections[indexFound] = unique([...connection, ...newConnections[indexFound]]);
                for (const key of connection) {
                    if (connected[key] === undefined) {
                        connected[key] = indexFound;
                    }
                }
                didModify = true;
            } else {
                for (const key of connection) {
                    connected[key] = i;
                }
                newConnections.push(connection);
            }
            return acc;
        },
        { connected: Object.create(null), newConnections: [] }
    );
    if (didModify) {
        return linkConnections(newConnections);
    }
    return connections;
};

/**
 * Given a list of contacts, extract the ones that can be merged
 * @param {Array<Object>} contacts      Each contact is an object { ID, emails, Name, LabelIDs }
 *
 * @returns {Array<Array<Object>>}      List of groups of contacts that can be merged
 */
export const extractMergeable = (contacts = []) => {
    // detect duplicate names
    // namesConnections = { name: [contact indices with that name] }
    const namesConnections = Object.values(
        contacts.reduce((acc, { Name }, index) => {
            const name = normalize(Name);

            if (!acc[name]) {
                acc[name] = [index];
            } else {
                acc[name].push(index);
            }

            return acc;
        }, Object.create(null))
    )
        .map(unique)
        .filter((connection) => connection.length > 1);

    // detect duplicate emails
    // emailConnections = { email: [contact indices with that email] }
    const emailConnections = Object.values(
        contacts.reduce((acc, { emails }, index) => {
            emails.map(normalize).forEach((email) => {
                if (!acc[email]) {
                    acc[email] = [index];
                } else {
                    acc[email].push(index);
                }
            });
            return acc;
        }, Object.create(null))
    )
        .map(unique)
        .filter((connection) => connection.length > 1);

    // Now we collect contact indices that go together
    // either in duplicate names or duplicate emails.
    const allConnections = linkConnections([...namesConnections, ...emailConnections]);

    return allConnections.map((indices) => indices.map((index) => contacts[index]));
};

/**
 * Given the value and field of a contact property, and a list of merged properties,
 * return null if the value has been merged, or the new value to be merged otherwise
 * @param {String|Array} value
 * @param {String} field
 * @param {Array} mergedValues
 *
 * @return {?String}
 */
const extractNewValue = (value, field, mergedValues) => {
    //  the field adr has to be treated separately since it has an array value
    if (field === 'adr') {
        // the array structure of an 'adr' value is
        // value = [ PObox, extAdr, street, city, region, postalCode, country ]
        // each of the elements inside value can be a string or an array of strings

        // check adr element by adr element to see if there are new values
        const isNew = mergedValues.map((mergedValue) =>
            mergedValue.map((component, index) => {
                const componentIsArray = Array.isArray(component);
                const valueIsArray = Array.isArray(value[index]);
                if (componentIsArray && valueIsArray) {
                    return value.some((str) => !component.includes(str));
                }
                if (!componentIsArray && !valueIsArray) {
                    return component !== value;
                }
                return true;
            })
        );
        return isNew ? value : null;
    }
    // for the other fields, value is a string, and mergedValues an array of strings
    return !mergedValues.includes(value) ? value : null;
};

/**
 * Merge a list of contacts. The contacts must be ordered in terms of preference.
 * @param {Array<Array<Object>>} contacts   Each contact is a list of properties [{ pref, field, group, type, value }]
 *
 * @return {Array}                          The merged contact
 */
export const merge = (contacts) => {
    if (!contacts.length) {
        return [];
    }

    const { mergedContact } = contacts.reduce(
        (acc, contact, index) => {
            const { mergedContact, mergedProperties, mergedPropertiesPrefs, mergedGroups } = acc;
            if (index === 0) {
                // merged contact inherits all properties from the first contact
                mergedContact.push(...contact);
                // keep track of merged properties and prefs
                for (const { pref, field, value, group } of contact) {
                    if (!mergedProperties[field]) {
                        mergedProperties[field] = [value];
                        mergedPropertiesPrefs[field] = [pref];
                    } else {
                        mergedProperties[field].push(value);
                        mergedPropertiesPrefs[field].push(+pref);
                    }
                    group && mergedGroups.push(group);
                }
            } else {
                // for the other contacts, keep only non-merged properties

                // but first prepare to change repeated groups
                const groups = contact.map(({ group }) => group).filter(Boolean);
                const changeGroup = groups.reduce((acc, group) => {
                    if (!mergedGroups.includes(group)) {
                        return acc;
                    }
                    acc[group] = generateNewGroupName(mergedGroups);
                    return acc;
                }, {});

                for (const property of contact) {
                    const { pref, field, group, value } = property;
                    const newGroup = group ? changeGroup[group] : group;
                    if (!mergedProperties[field]) {
                        // an unseen property is directly merged
                        mergedContact.push({ ...property, pref: +pref, group: newGroup });
                        mergedProperties[field] = [value];
                        mergedPropertiesPrefs[field] = [+pref];
                        newGroup && mergedGroups.push(newGroup);
                    } else {
                        // for properties already seen, check if we should merge a potential new value for it
                        const newValue = extractNewValue(value, field, mergedProperties[field]);
                        const newPref = Math.max(...mergedPropertiesPrefs[field]) + 1;
                        const canAdd =
                            isCustomField(field) ||
                            [ONE_OR_MORE_MAY_BE_PRESENT, ONE_OR_MORE_MUST_BE_PRESENT].includes(
                                PROPERTIES[field].cardinality
                            );

                        if (!!newValue && canAdd) {
                            mergedContact.push({ ...property, pref: newPref, value: newValue, group: newGroup });
                            mergedProperties[field].push(newValue);
                            mergedPropertiesPrefs[field] = [newPref];
                            newGroup && mergedGroups.push(newGroup);
                        }
                    }
                }
            }
            return acc;
        },
        {
            mergedContact: [],
            mergedProperties: Object.create(null),
            mergedPropertiesPrefs: Object.create(null),
            mergedGroups: []
        }
    );

    return mergedContact;
};
