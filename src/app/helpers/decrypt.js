import { getMessage, decryptMessage, getSignature, verifyMessage, createCleartextMessage } from 'pmcrypto';
import { merge, parse } from './vcard';

import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';

const { CLEAR_TEXT, ENCRYPTED_AND_SIGNED, ENCRYPTED, SIGNED } = CONTACT_CARD_TYPE;

const SIGNATURE_NOT_VERIFIED = 1;
const FAIL_TO_READ = 2;

const decrypt = async ({ Data }, { privateKeys }) => {
    try {
        const message = await getMessage(Data);
        const data = await decryptMessage({ message, privateKeys, armor: true });
        return { data };
    } catch (error) {
        return { error: FAIL_TO_READ };
    }
};

const signed = async ({ Data, Signature }, { publicKeys }) => {
    try {
        const signature = await getSignature(Signature);
        const { verified } = await verifyMessage({
            message: createCleartextMessage(Data),
            publicKeys,
            signature
        });

        if (verified !== 1) {
            return { data: Data, error: SIGNATURE_NOT_VERIFIED };
        }
        return { data: Data };
    } catch (error) {
        return { error: FAIL_TO_READ };
    }
};

const decryptSigned = async ({ Data, Signature }, { publicKeys, privateKeys }) => {
    try {
        const [message, signature] = await Promise.all([getMessage(Data), getSignature(Signature)]);
        const { data, verified } = await decryptMessage({
            message,
            privateKeys,
            publicKeys,
            armor: true,
            signature
        });

        if (verified !== 1) {
            return { data, error: SIGNATURE_NOT_VERIFIED };
        }

        return { data };
    } catch (error) {
        return { error: FAIL_TO_READ };
    }
};

const clearText = ({ Data }) => ({ data: Data });

const ACTIONS = {
    [ENCRYPTED_AND_SIGNED]: decryptSigned,
    [SIGNED]: signed,
    [ENCRYPTED]: decrypt,
    [CLEAR_TEXT]: clearText
};

export const prepareContact = async (contact, { publicKeys, privateKeys }) => {
    const { Cards } = contact;

    const data = await Promise.all(
        Cards.map((card) => {
            if (!ACTIONS[card.Type]) {
                return { error: FAIL_TO_READ };
            }
            return ACTIONS[card.Type](card, { publicKeys, privateKeys });
        })
    );

    const { vcards, errors } = data.reduce(
        (acc, { data, error }) => {
            if (error) {
                acc.errors.push(error);
            }
            if (data) {
                acc.vcards.push(data);
            }
            return acc;
        },
        { vcards: [], errors: [] }
    );

    return { properties: merge(vcards.map(parse)), errors };
};

export const decryptContactCards = async (contactCards, contactID, { publicKeys, privateKeys }) => {
    try {
        const { properties, errors } = await prepareContact({ Cards: contactCards }, { publicKeys, privateKeys });
        if (errors.length !== 0) {
            throw new Error('Error decrypting contact with contactID ', contactID);
        }
        return properties;
    } catch (error) {
        throw error;
    }
};

/**
 * generate list of public keys corresponding to a list of private keys
 * @param {Object} userKeysList     { privateKeys: Array<PGPkey> }
 * @return {Object}                 { publicKeys: Array<PGPkey>, privateKeys: Array<PGPkey>}
 */
export const bothUserKeys = (userKeysList) => {
    return userKeysList.reduce(
        (acc, { privateKey }) => {
            if (!privateKey.isDecrypted()) {
                return acc;
            }
            acc.publicKeys.push(privateKey.toPublic());
            acc.privateKeys.push(privateKey);
            return acc;
        },
        { publicKeys: [], privateKeys: [] }
    );
};
