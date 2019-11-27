import { getMessage, decryptMessage, getSignature, verifyMessage, createCleartextMessage } from 'pmcrypto';
import { merge, parse } from './vcard';
import { sanitizeProperties } from './properties';

import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';
import { SIGNATURE_NOT_VERIFIED, FAIL_TO_READ, FAIL_TO_DECRYPT } from '../constants';

const { CLEAR_TEXT, ENCRYPTED_AND_SIGNED, ENCRYPTED, SIGNED } = CONTACT_CARD_TYPE;

const decrypt = async ({ Data }, { privateKeys }) => {
    let message;
    try {
        message = await getMessage(Data);
    } catch (error) {
        return { error: FAIL_TO_READ };
    }

    try {
        const data = await decryptMessage({ message, privateKeys, armor: true });
        return { data };
    } catch (error) {
        return { error: FAIL_TO_DECRYPT };
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

    const decryptedCards = await Promise.all(
        Cards.map(async (card) => {
            if (!ACTIONS[card.Type]) {
                return { error: FAIL_TO_READ };
            }
            return ACTIONS[card.Type](card, { publicKeys, privateKeys });
        })
    );
    // remove UIDs put by mistake in encrypted cards
    const sanitizedCards = decryptedCards.map((card, i) => {
        if (![ENCRYPTED_AND_SIGNED, ENCRYPTED].includes(Cards[i].Type) || !card.data) {
            return card;
        }
        return { ...card, data: card.data.replace(/\nUID:.*\n/i, '\n') };
    });

    const { vcards, errors } = sanitizedCards.reduce(
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

    return { properties: sanitizeProperties(merge(vcards.map(parse))), errors };
};
