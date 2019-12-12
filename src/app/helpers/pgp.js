import { RECIPIENT_TYPE, KEY_FLAGS } from 'proton-shared/lib/constants';
import { arrayToBinaryString, encodeBase64 } from 'pmcrypto';
import { serverTime } from 'pmcrypto/lib/serverTime';
import { toBitMap } from 'proton-shared/lib/helpers/object';

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

/**
 * Sort list of keys retrieved from the API. Trusted keys take preference.
 * For two keys, both trusted or not, non-verify-only keys take preference
 * @param {Array} keys
 * @param {Set} trustedFingerprints
 * @param {Set} verifyOnlyFingerprints
 * @returns {Array}
 */
export const sortApiKeys = (keys = [], trustedFingerprints, verifyOnlyFingerprints) =>
    keys
        .reduce(
            (acc, key) => {
                const fingerprint = key.getFingerprint();
                // calculate order through a bitmap
                const index = toBitMap({
                    isVerificationOnly: verifyOnlyFingerprints.has(fingerprint),
                    isNotTrusted: !trustedFingerprints.has(fingerprint)
                });
                acc[index].push(key);
                return acc;
            },
            Array.from({ length: 4 }).map(() => [])
        )
        .flat();

/**
 * Sort list of pinned keys retrieved from the API. Keys that can be used for sending take preference
 * @param {Array} keys
 * @param {Set} expiredFingerprints
 * @param {Set} revokedFingerprints
 * @returns {Array}
 */
export const sortPinnedKeys = (keys = [], expiredFingerprints, revokedFingerprints) =>
    keys
        .reduce(
            (acc, key) => {
                const fingerprint = key.getFingerprint();
                // calculate order through a bitmap
                const index = toBitMap({
                    cannotSend: expiredFingerprints.has(fingerprint) || revokedFingerprints.has(fingerprint)
                });
                acc[index].push(key);
                return acc;
            },
            Array.from({ length: 2 }).map(() => [])
        )
        .flat();

/**
 * Given a key, return its expiration and revoke status
 * @param publicKey
 * @param date          Unix timestamp
 * @returns {Promise<{expired: boolean, revoked: boolean}>}
 */
export const getKeyEncryptStatus = async (publicKey) => {
    const date = +serverTime();
    const creationTime = publicKey.getCreationTime();
    // notice there are different expiration times depending on the use of the key.
    const expirationTime = await publicKey.getExpirationTime('encrypt');
    const isExpired = !(creationTime <= date && date <= expirationTime);
    const isRevoked = await publicKey.isRevoked();
    return { isExpired, isRevoked };
};
