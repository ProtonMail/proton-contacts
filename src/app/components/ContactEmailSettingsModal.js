import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    FormModal,
    Alert,
    Row,
    Label,
    Field,
    Info,
    LinkButton,
    useApi,
    useMailSettings,
    useUser,
    useUserKeys,
    useNotifications
} from 'react-components';
import { binaryStringToArray, decodeBase64 } from 'pmcrypto';
import { c } from 'ttag';
import { getKeys } from 'pmcrypto';
import { RECIPIENT_TYPE, PACKAGE_TYPE } from 'proton-shared/lib/constants';
import { API_CUSTOM_ERROR_CODES } from 'proton-shared/lib/errors';
import { getPublicKeys } from 'proton-shared/lib/api/keys';
import { noop } from 'proton-shared/lib/helpers/function';

import ContactMIMETypeSelect from './ContactMIMETypeSelect';
import { isInternalUser, isDisabledUser, getRawInternalKeys, allKeysExpired, hasNoPrimary } from '../helpers/pgp';
import { VCARD_KEY_FIELDS } from '../constants';
import ContactPgpSettings from './ContactPgpSettings';
import { prepareContacts } from '../helpers/encrypt';
import { addContacts } from 'proton-shared/lib/api/contacts';

const { SEND_PGP_INLINE, SEND_PGP_MIME } = PACKAGE_TYPE;
const { TYPE_NO_RECEIVE } = RECIPIENT_TYPE;
const { KEY_GET_ADDRESS_MISSING, KEY_GET_DOMAIN_MISSING_MX, KEY_GET_INPUT_INVALID } = API_CUSTOM_ERROR_CODES;
const EMAIL_ERRORS = [KEY_GET_ADDRESS_MISSING, KEY_GET_DOMAIN_MISSING_MX, KEY_GET_INPUT_INVALID];

const PGP_MAP = {
    [SEND_PGP_INLINE]: 'pgp-inline',
    [SEND_PGP_MIME]: 'pgp-mime'
};

const ContactEmailSettingsModal = ({ contactID, properties, contactEmail, ...rest }) => {
    const { Email } = contactEmail;
    const [loading, setLoading] = useState(false);
    const { createNotification } = useNotifications();
    const emailProperty = properties.find(({ value }) => value === Email);
    const { group: emailGroup } = emailProperty;
    const api = useApi();
    const [user] = useUser();
    const [userKeysList, loadingUserKeys] = useUserKeys(user);
    const [model, setModel] = useState({});
    const [{ PGPScheme, Sign }, loadingMailSettings] = useMailSettings(); // NOTE MailSettings model needs to be loaded

    /**
     * Detect current scheme
     * @param {String} scheme
     * @returns {Boolean}
     */
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
            // eslint-disable-next-line no-unused-vars
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

    /**
     * Initialize the model for the modal
     * @returns {Promise}
     */
    const prepare = async () => {
        const { contactKeyPromises, mimeType, encrypt, scheme, sign } = properties
            .filter(({ field, group }) => VCARD_KEY_FIELDS.includes(field) && group === emailProperty.group)
            .reduce(
                (acc, { field, value }) => {
                    if (field === 'key' && value) {
                        const [, base64 = ''] = value.split(',');
                        const key = binaryStringToArray(decodeBase64(base64));

                        if (key.length) {
                            const promise = getKeys(key)
                                .then(([publicKey]) => publicKey)
                                .catch(noop);
                            acc.contactKeyPromises.push(promise);
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
                { contactKeyPromises: [], mimeType: '', encrypt: false, scheme: '', sign: Sign === 1 } // Default values
            );
        const contactKeys = (await Promise.all(contactKeyPromises)).filter(Boolean);
        const config = await getKeysFromApi(contactEmail.Email);
        const internalUser = isInternalUser(config);
        const externalUser = !internalUser;
        const apiKeys = (await Promise.all(
            config.Keys.map(({ PublicKey }) =>
                getKeys(PublicKey)
                    .then(([publicKey]) => publicKey)
                    .catch(noop)
            )
        )).filter(Boolean);
        const [unarmoredKeys, keysExpired] = await Promise.all([
            getRawInternalKeys(config),
            allKeysExpired(contactKeys)
        ]);

        const trusted = internalUser ? contactKeys.map((publicKey) => publicKey.getFingerprint()) : [];
        setModel({
            mimeType,
            encrypt,
            scheme,
            sign,
            email: Email,
            keys: internalUser && !contactKeys.length ? apiKeys : contactKeys,
            trusted,
            isPGPExternal: externalUser,
            isPGPInternal: internalUser,
            pgpAddressDisabled: isDisabledUser(config),
            noPrimary: hasNoPrimary(unarmoredKeys, contactKeys),
            keysExpired,
            isPGPInline: externalUser && hasSheme('pgp-inline'),
            isPGPMime: externalUser && hasSheme('pgp-mime')
        });
    };

    /**
     * Collect keys from the model to save
     * @param {String} group attach to the current email address
     * @returns {Array} key properties to save in the vCard
     */
    const getKeysProperties = (group) => {
        const toKeyProperty = (publicKey, index) => ({
            field: 'key',
            value: publicKey.armor(),
            group,
            pref: `${index + 1}`
        });

        if (model.isPGPExternal) {
            return model.keys.map(toKeyProperty);
        }

        return model.keys.filter((publicKey) => model.trusted.includes(publicKey.getFingerprint())).map(toKeyProperty);
    };

    /**
     * Save send preferences
     * @returns {Promise}
     */
    const handleSubmit = async () => {
        const otherProperties = properties.filter((acc, { field, group }) => {
            return !VCARD_KEY_FIELDS.includes(field) || (group && group !== emailGroup);
        });
        const emailProperties = [
            emailProperty,
            model.mimeType && { field: 'x-pm-mimetype', value: model.mimeType, group: emailGroup },
            model.isPGPExternal && model.encrypt && { field: 'x-pm-encrypt', value: 'true', group: emailGroup },
            model.isPGPExternal && model.sign && { field: 'x-pm-sign', value: 'true', group: emailGroup },
            model.isPGPExternal && model.scheme && { field: 'x-pm-scheme', value: model.scheme, group: emailGroup },
            ...getKeysProperties(emailGroup) // [{ field: 'key' }, ]
        ].filter(Boolean);
        const Contacts = await prepareContacts([otherProperties.concat(emailProperties)], userKeysList[0]);
        await api(addContacts({ Contacts, Overwrite: +!!contactID, Labels: 0 }));
        rest.onClose();
        createNotification({ text: c('Success').t`Preferences saved` });
    };

    useEffect(() => {
        if (!loadingMailSettings && !loadingUserKeys) {
            setLoading(true);
            prepare()
                .then(() => setLoading(false))
                .catch(() => setLoading(false));
        }
    }, [loadingMailSettings, loadingUserKeys]);

    return (
        <FormModal
            loading={loading || loadingMailSettings || loadingUserKeys}
            submit={c('Action').t`Save`}
            onSubmit={() => {
                setLoading(true);
                handleSubmit()
                    .then(() => setLoading(false))
                    .catch(() => setLoading(false));
            }}
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
                        disabled={model.isPGPExternal && (model.encrypt || model.sign)}
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
    contactID: PropTypes.string,
    properties: PropTypes.array,
    contactEmail: PropTypes.object.isRequired
};

export default ContactEmailSettingsModal;
