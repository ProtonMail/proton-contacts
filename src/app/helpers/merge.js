import { normalize } from 'proton-shared/lib/helpers/string';

import { getEmails } from './contact';

export const extractMergeable = (contacts = []) => {
    // detect duplicate names
    // namesConnections = { name: [contact indices with that name] }
    const namesConnections = contacts.reduce((acc, { Name }, index) => {
        const name = normalize(Name);
        if (!acc[name]) {
            acc[name] = [index];
        } else {
            acc[name].push(index);
        }
        return acc;
    }, Object.create(null));
    // detect duplicate emails
    // emailConnections = { email: [contact indices with that email] }
    const emailConnections = contacts.reduce((acc, { Emails }, index) => {
        Emails.map(normalize).forEach((email) => {
            if (!acc[email]) {
                acc[email] = [index];
            } else {
                acc[email].push(index);
            }
        });
        return acc;
    }, Object.create(null));
    // Now we collect contact indices that go together
    // either in duplicate names or duplicate emails.
    const { mergeableIndices } = Object.keys(namesConnections).reduce(
        (acc, name) => {
            const { mergeableIndices, isUsed } = acc;
            const indices = namesConnections[name];
            for (const index of indices) {
                if (!isUsed[index]) {
                    if (!mergeableIndices[name]) {
                        mergeableIndices[name] = [index];
                    }
                    for (const email of getEmails(contacts[index])) {
                        for (const j of emailConnections[email]) {
                            if (!mergeableIndices[name].includes(j) && !isUsed[j]) {
                                mergeableIndices[name].push(j);
                                isUsed[j] = true;
                            }
                        }
                    }
                    isUsed[index] = true;
                } else {
                    indices.splice(indices.indexOf(index), 1);
                }
            }
            return acc;
        },
        { mergeableIndices: Object.create(null), isUsed: Object.create(null) }
    );

    return Object.values(mergeableIndices)
        .filter((arr) => arr.length > 1)
        .map((indices) => indices.map((index) => contacts[index]));
};
