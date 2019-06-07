import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getContact } from 'proton-shared/lib/api/contacts';
import { useApi, Loader } from 'react-components';
import { CONTACT_CARD_TYPE } from 'proton-shared/lib/constants';
import { getMessage, decryptMessage, getSignature, verifyMessage, createCleartextMessage } from 'pmcrypto';

import { merge, parse } from '../helpers/vcard';
import ContactView from './ContactView';

const { CLEAR_TEXT, ENCRYPTED_AND_SIGNED, ENCRYPTED, SIGNED } = CONTACT_CARD_TYPE;
const SIGNATURED_NOT_VERIFIED = 1;
const FAIL_TO_READ = 2;
const FAIL_TO_LOAD = 3;

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
            return { data, error: SIGNATURED_NOT_VERIFIED };
        }

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
            return { data: Data, error: SIGNATURED_NOT_VERIFIED };
        }
        return { data: Data };
    } catch (error) {
        return { error: FAIL_TO_READ };
    }
};

const decrypt = async ({ Data }, { privateKeys }) => {
    try {
        const message = await getMessage(Data);
        const data = await decryptMessage({ message, privateKeys, armor: true });
        return { data };
    } catch (error) {
        return { error: FAIL_TO_READ };
    }
};

const clearText = ({ Data }) => Data;

const ACTIONS = {
    [ENCRYPTED_AND_SIGNED]: decryptSigned,
    [SIGNED]: signed,
    [ENCRYPTED]: decrypt,
    [CLEAR_TEXT]: clearText
};

const prepareContact = async (contact, keys) => {
    const { Cards } = contact;
    const data = await Promise.all(
        Cards.map((card) => {
            if (!ACTIONS[card.Type]) {
                return { error: FAIL_TO_READ };
            }
            return ACTIONS[card.Type](card, keys);
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

const Contact = ({ contactID, userKeysList }) => {
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [model, setModel] = useState({ properties: [], errors: [] });
    const { properties, errors } = model;
    const { publicKeys, privateKeys } = userKeysList.reduce(
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

    const request = async () => {
        try {
            setLoading(true);
            const { Contact } = await api(getContact(contactID));
            const { properties, errors } = await prepareContact(Contact, { publicKeys, privateKeys });
            setModel({ properties, errors });
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setModel({ ...model, errors: [FAIL_TO_LOAD] });
            throw error;
        }
    };

    useEffect(() => {
        if (Array.isArray(userKeysList)) {
            request();
        }
    }, [contactID, userKeysList]);

    if (loading) {
        return <Loader />;
    }

    return <ContactView properties={properties} contactID={contactID} errors={errors} />;
};

Contact.propTypes = {
    contactID: PropTypes.string.isRequired,
    userKeysList: PropTypes.array
};

export default Contact;
