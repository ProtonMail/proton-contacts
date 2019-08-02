import { normalize } from 'proton-shared/lib/helpers/string';

import { ONE_OR_MORE_MUST_BE_PRESENT, ONE_OR_MORE_MAY_BE_PRESENT, PROPERTIES, isCustomField } from './vcard';
import { addGroup } from './properties';
import { unique } from 'proton-shared/lib/helpers/array';

const findAllConnections = (initialConnections, connections) => {
    if (!connections.length) {
        // nothing to do
        return initialConnections;
    }

    let modified = false;
    const newConnections = connections.reduce((acc, connection) => {
        for (const index of connection) {
            acc.forEach((oldConnection, i) => {
                if (oldConnection.includes(index)) {
                    const lengthBefore = acc[i].length;
                    acc[i] = unique([...acc[i], ...connection]);
                    if (acc[i].length !== lengthBefore) {
                        modified = true;
                    }
                    return acc;
                }
            });
        }
        return acc;
    }, initialConnections);

    if (modified) {
        return findAllConnections(newConnections, [connections, ...initialConnections]);
    }
    return newConnections.reduce(
        (acc, connection) => {
            const { filteredConnections, usedIndices } = acc;
            if (!connection.some((index) => usedIndices.includes(index))) {
                filteredConnections.push(connection);
                usedIndices.push(...connection);
            }
            return acc;
        },
        { filteredConnections: [], usedIndices: [] }
    ).filteredConnections;
};

/**
 * Given a list of contacts, extract the ones that can be merged
 * @param {Array<Object>} contacts      Each contact is an object { ID, Emails, Name, LabelIDs }
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
        contacts.reduce((acc, { Emails }, index) => {
            Emails.map(normalize).forEach((email) => {
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
    const allConnections = findAllConnections(emailConnections, findAllConnections(namesConnections, emailConnections));

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
    //  the fields adr and nickname have to be treated separately since they have array values
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
    if (field === 'nickname') {
        const newNicknames = value.filter((nickname) => !mergedValues.flat().includes(nickname));
        return newNicknames.length ? newNicknames : null;
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

    const merged = contacts.reduce(
        (acc, contact, index) => {
            const { mergedContact, mergedProperties, mergedPropertiesPrefs } = acc;
            if (index === 0) {
                // merged contact inherits all properties from the first contact
                mergedContact.push(...contact);
                // keep track of merged properties and prefs
                for (const { pref, field, value } of contact) {
                    if (!mergedProperties[field]) {
                        mergedProperties[field] = [value];
                        mergedPropertiesPrefs[field] = [pref];
                    } else {
                        mergedProperties[field].push(value);
                        mergedPropertiesPrefs[field].push(+pref);
                    }
                }
            } else {
                // for the other contacts, keep only non-merged properties
                for (const { pref, field, group, type, value } of contact) {
                    if (!mergedProperties[field]) {
                        // an unseen property is directly merged
                        mergedContact.push({ pref: +pref, field, group, type, value });
                        mergedProperties[field] = [value];
                        mergedPropertiesPrefs[field] = [+pref];
                    } else {
                        const newValue = extractNewValue(value, field, mergedProperties[field]);
                        const newPref = Math.max(...mergedPropertiesPrefs[field]) + 1;
                        const canAdd =
                            !isCustomField(field) &&
                            [ONE_OR_MORE_MAY_BE_PRESENT, ONE_OR_MORE_MUST_BE_PRESENT].includes(
                                PROPERTIES[field].cardinality
                            );
                        // TODO: what to do with custom properties

                        if (!!newValue && canAdd) {
                            mergedContact.push({ pref: newPref, field, group, type, value: newValue });
                            mergedProperties[field].push[newValue];
                            mergedPropertiesPrefs[field] = [newPref];
                        }
                    }
                }
            }
            return acc;
        },
        { mergedContact: [], mergedProperties: Object.create(null), mergedPropertiesPrefs: Object.create(null) }
    ).mergedContact;

    // fix groups for emails in case some are repeated
    return addGroup(merged);
};
