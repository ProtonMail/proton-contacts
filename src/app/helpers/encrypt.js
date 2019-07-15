import { encryptMessage, signMessage } from 'pmcrypto';
import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';
import { c } from 'ttag';

import { generateUID } from './contact';
import { CLEAR_FIELDS, SIGNED_FIELDS } from '../constants';
import { toICAL } from './vcard';
import { sanitizeProperties, addPref, addGroup } from './properties';

const { CLEAR_TEXT, ENCRYPTED_AND_SIGNED, SIGNED } = CONTACT_CARD_TYPE;

/**
 * Split properties for contact cards
 * @param {Array} properties
 * @returns {Object}
 */
export const splitProperties = (properties) => {
    return properties.reduce(
        (acc, property) => {
            const { field } = property;

            if (CLEAR_FIELDS.includes(field)) {
                acc.toClearText.push(property);
                return acc;
            }

            if (SIGNED_FIELDS.includes(field)) {
                acc.toSign.push(property);
                return acc;
            }

            acc.toEncryptAndSign.push(property);
            return acc;
        },
        { toEncryptAndSign: [], toSign: [], toClearText: [] }
    );
};

/**
 * Prepare contact cards
 * @param {Array} contacts
 * @param {Array} privateKeys
 * @param {Array} publicKeys
 * @returns {Promise}
 */
export const prepareCards = (properties = [], privateKeys, publicKeys) => {
    const promises = [];
    const { toEncryptAndSign = [], toSign = [], toClearText = [] } = splitProperties(properties);

    if (toEncryptAndSign.length > 0) {
        const data = toICAL(toEncryptAndSign).toString();

        promises.push(
            encryptMessage({ data, publicKeys, privateKeys, armor: true, detached: true }).then(
                ({ data: Data, signature: Signature }) => ({
                    Type: ENCRYPTED_AND_SIGNED,
                    Data,
                    Signature
                })
            )
        );
    }

    if (toSign.length > 0) {
        const hasUID = toSign.some((property) => property.field === 'uid');
        const hasFN = toSign.some((property) => property.field === 'fn');

        if (!hasUID) {
            const defaultUID = generateUID();
            toSign.push({ field: 'uid', value: defaultUID });
        }

        if (!hasFN) {
            const defaultFN = c('Default display name vcard').t`Unknown`;
            toSign.push({ field: 'fn', value: defaultFN });
        }

        const data = toICAL(toSign).toString();

        promises.push(
            signMessage({ data, privateKeys, armor: true, detached: true }).then(({ signature: Signature }) => ({
                Type: SIGNED,
                Data: data,
                Signature
            }))
        );
    }

    if (toClearText.length > 0) {
        const Data = toICAL(toClearText).toString();

        promises.push({
            Type: CLEAR_TEXT,
            Data,
            Signature: null
        });
    }

    return Promise.all(promises);
};

/**
 * Clean properties
 * Parse properties to build vCards
 * @param {Array} properties
 * @param {Array} privateKeys
 * @param {Array} publicKeys
 * @return {Object}
 */
export const prepareContact = async (properties, privateKeys, publicKeys) => {
    const sanitized = sanitizeProperties(properties);
    const withPref = addPref(sanitized);
    const withGroup = addGroup(withPref);
    const Cards = await prepareCards(withGroup, privateKeys, publicKeys);
    return { Cards };
};

/**
 * Prepare contacts data to be saved with the API
 * @param {Array} contacts
 * @param {Object} primaryKey
 * @returns {Promise} data
 */
export const prepareContacts = async (contacts = [], primaryKey) => {
    const { privateKey } = primaryKey;
    const publicKey = privateKey.toPublic();
    const promises = contacts.reduce((acc, properties) => {
        acc.push(prepareContact(properties, [privateKey], [publicKey]));
        return acc;
    }, []);

    return Promise.all(promises);
};
