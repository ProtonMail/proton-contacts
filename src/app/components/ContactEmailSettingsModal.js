import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormModal, Alert, Row, Label, Field, Info, LinkButton, useApi, useMailSettings } from 'react-components';
import { binaryStringToArray, decodeBase64, encodeBase64, arrayToBinaryString } from 'pmcrypto';
import { c } from 'ttag';
import { RECIPIENT_TYPE, PACKAGE_TYPE } from 'proton-shared/lib/constants';
import { API_CUSTOM_ERROR_CODES } from 'proton-shared/lib/errors';
import { getPublicKeys } from 'proton-shared/lib/api/keys';

import ContactMIMETypeSelect from './ContactMIMETypeSelect';
import { isInternalUser, isDisabledUser, getRawInternalKeys, allKeysExpired } from '../helpers/pgp';
import { VCARD_KEY_FIELDS } from '../constants';
import ContactPgpSettings from './ContactPgpSettings';

const { SEND_PGP_INLINE, SEND_PGP_MIME } = PACKAGE_TYPE;
const { TYPE_NO_RECEIVE } = RECIPIENT_TYPE;
const { KEY_GET_ADDRESS_MISSING, KEY_GET_DOMAIN_MISSING_MX, KEY_GET_INPUT_INVALID } = API_CUSTOM_ERROR_CODES;
const EMAIL_ERRORS = [KEY_GET_ADDRESS_MISSING, KEY_GET_DOMAIN_MISSING_MX, KEY_GET_INPUT_INVALID];

const PGP_MAP = {
    [SEND_PGP_INLINE]: 'pgp-inline',
    [SEND_PGP_MIME]: 'pgp-mime'
};

const ContactEmailSettingsModal = ({ properties, contactEmail, ...rest }) => {
    const { Email } = contactEmail;
    const [{ Sign }] = useMailSettings(); // MailSettings model needs to be loaded
    const api = useApi();
    const [model, setModel] = useState({});
    const [{ PGPScheme }] = useMailSettings();

    const hasSheme = (scheme) => {
        if (!model.scheme) {
            return PGP_MAP[PGPScheme] === scheme;
        }

        return model.scheme === scheme;
    };

    /**
     * Get the keys for an email address from the API.
     * @param {String} Email
     * @returns {Promise<{RecipientType, MIMEType, Keys}>}
     */
    const getKeysFromApi = async (Email) => {
        try {
            const { Code, ...data } = await api(getPublicKeys({ Email }));
            return data;
        } catch (error) {
            const { data = {} } = error;

            if (EMAIL_ERRORS.includes(data.Code)) {
                return {
                    RecipientType: TYPE_NO_RECEIVE,
                    MIMEType: null,
                    Keys: []
                };
            }

            throw error;
        }
    };

    const prepare = async () => {
        const emailProperty = properties.find(({ value }) => value === Email);
        const { contactKeys, mimeType, encrypt, scheme, sign } = properties
            .filter(({ field, group }) => VCARD_KEY_FIELDS.includes(field) && group === emailProperty.group)
            .reduce(
                (acc, { field, value }) => {
                    if (field === 'key' && value) {
                        const [, base64 = ''] = value.split(',');
                        const data = binaryStringToArray(decodeBase64(base64));

                        if (data.length) {
                            acc.contactKeys.push(data);
                        }

                        return acc;
                    }

                    if (field === 'x-pm-encrypt' && value) {
                        acc.encrypt = value === 'true';
                        return acc;
                    }

                    if (field === 'x-pm-sign' && value) {
                        acc.sign = value === 'true';
                        return acc;
                    }

                    if (field === 'x-pm-scheme' && value) {
                        acc.scheme = value;
                        return acc;
                    }

                    if (field === 'x-pm-mimetype' && value) {
                        acc.mimeType = value;
                        return acc;
                    }

                    return acc;
                },
                { contactKeys: [], mimeType: '', encrypt: false, scheme: '', sign: Sign === 1 } // Default values
            );
        const config = await getKeysFromApi(contactEmail.Email);
        const internalUser = isInternalUser(config);
        const externalUser = !internalUser;
        const apiKeys = config.Keys.map(({ PublicKey }) => PublicKey);
        const [unarmoredKeys, keysExpired] = await Promise.all([
            getRawInternalKeys(config),
            allKeysExpired(contactKeys)
        ]);
        const noPrimary = !unarmoredKeys.some((k) =>
            contactKeys.map((value) => encodeBase64(arrayToBinaryString(value))).includes(k)
        );

        setModel({
            mimeType,
            encrypt,
            scheme,
            sign,
            email: Email,
            keys: internalUser && !contactKeys.length ? apiKeys : contactKeys,
            trust: internalUser && contactKeys.length > 0,
            isPGPExternal: externalUser,
            isPGPInternal: internalUser,
            pgpAddressDisabled: isDisabledUser(config),
            noPrimary,
            keysExpired,
            isPGPInline: externalUser && hasSheme('pgp-inline'),
            isPGPMime: externalUser && hasSheme('pgp-mime')
        });
    };

    const handleSubmit = () => {};

    useEffect(() => {
        prepare();
    }, []);

    return (
        <FormModal
            submit={c('Action').t`Save`}
            onSubmit={handleSubmit}
            title={c('Title').t`Email settings (${contactEmail.Email})`}
            {...rest}
        >
            <Alert learnMore="TODO">{c('Info')
                .t`Select the email format you want to be used by default when sending an email to this email address.`}</Alert>
            <Row>
                <Label>
                    {c('Label').t`Email format`}
                    <Info
                        className="ml0-5"
                        title={c('Tooltip')
                            .t`Automatic indicates that the format in the composer is used to send to this user. Plain text indicates that the message will always be converted to plain text on send.`}
                    />
                </Label>
                <Field>
                    <ContactMIMETypeSelect
                        disabled={model.encrypt || model.sign}
                        value={model.mimeType}
                        onChange={(mimeType) => setModel({ ...model, mimeType })}
                    />
                </Field>
            </Row>
            <div className="mb1">
                <LinkButton onClick={() => setModel({ ...model, showPgpSettings: !model.showPgpSettings })}>
                    {model.showPgpSettings
                        ? c('Action').t`Hide advanced PGP settings`
                        : c('Action').t`Show advanced PGP settings`}
                </LinkButton>
            </div>
            {model.showPgpSettings ? <ContactPgpSettings model={model} setModel={setModel} /> : null}
        </FormModal>
    );
};

ContactEmailSettingsModal.propTypes = {
    properties: PropTypes.array,
    contactEmail: PropTypes.object.isRequired
};

export default ContactEmailSettingsModal;
