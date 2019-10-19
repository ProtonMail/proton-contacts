import { RECIPIENT_TYPE, KEY_FLAGS } from 'proton-shared/lib/constants';
import { arrayToBinaryString, encodeBase64, isExpiredKey, stripArmor } from 'pmcrypto';

const { TYPE_INTERNAL } = RECIPIENT_TYPE;
const { ENABLE_ENCRYPTION } = KEY_FLAGS;

/**
 * Check if it's an internal contact
 * @param {Integer} config.RecipientType from API
 * @returns {Boolean}
 */
export const isInternalUser = ({ RecipientType }) => RecipientType === TYPE_INTERNAL;

/**
 * Test if no key is enabled
 * @param {Object} config from API
 * @returns {Boolean}
 */
export const isDisabledUser = (config) =>
    isInternalUser(config) && !config.Keys.some(({ Flags }) => Flags & ENABLE_ENCRYPTION);

export const getRawInternalKeys = ({ Keys = [] }) => {
    return Promise.all(
        Keys.filter(({ Flags }) => Flags & ENABLE_ENCRYPTION).map(async ({ PublicKey }) => {
            const stripped = await stripArmor(PublicKey);
            return encodeBase64(arrayToBinaryString(stripped));
        })
    );
};

/**
 *
 * @param {Array} keys from vCard
 * @returns {Promise<Boolean>}
 */
export const allKeysExpired = async (keys = []) => {
    // We do not want to show any warnings if we don't have any keys
    if (!keys.length) {
        return false;
    }

    const keyObjects = keys.map((publicKey) => isExpiredKey(publicKey));
    const isExpired = await Promise.all(keyObjects);

    return !isExpired.some((keyExpired) => !keyExpired);
};

/**
 * Check if current email mismatch with email define in key data
 * @param {Array} key.users
 * @param {String} currentEmail
 * @returns {Boolean|Array<String>} emails
 */
export const emailMismatch = ({ users = [] }, currentEmail) => {
    const keyEmails = users.reduce((acc, { userId = {} } = {}) => {
        if (!userId || !userId.userid) {
            // userId can be set to null
            return acc;
        }
        // we don't normalize anything here because enigmail / pgp also doesn't normalize it.
        const [, email = userId.userid] = /<([^>]*)>/.exec(userId.userid) || [];
        acc.push(email);
        return acc;
    }, []);

    if (keyEmails.includes(currentEmail)) {
        return false;
    }

    return keyEmails;
};

export const hasNoPrimary = (unarmoredKeys = [], contactKeys = []) => {
    if (!unarmoredKeys.length) {
        return false;
    }
    const keys = contactKeys.map((value) => encodeBase64(arrayToBinaryString(value)));
    return !unarmoredKeys.some((k) => keys.includes(k));
};
