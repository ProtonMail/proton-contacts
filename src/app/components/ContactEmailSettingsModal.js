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
    useEventManager,
    useNotifications,
    useLoading
} from 'react-components';
import { getKeys, binaryStringToArray, arrayToBinaryString, encodeBase64, decodeBase64 } from 'pmcrypto';
import { c } from 'ttag';

import { prepareContacts } from '../helpers/encrypt';
import { hasCategories } from '../helpers/import';
import { isInternalUser, isDisabledUser, getRawInternalKeys, allKeysExpired, hasNoPrimary } from '../helpers/pgp';
import { getPublicKeys } from 'proton-shared/lib/api/keys';
import { noop } from 'proton-shared/lib/helpers/function';
import { addContacts } from 'proton-shared/lib/api/contacts';
import { VCARD_KEY_FIELDS, PGP_INLINE, PGP_MIME, PGP_SIGN, CATEGORIES } from '../constants';
import { RECIPIENT_TYPE, PACKAGE_TYPE } from 'proton-shared/lib/constants';
import { API_CUSTOM_ERROR_CODES } from 'proton-shared/lib/errors';

import ContactMIMETypeSelect from './ContactMIMETypeSelect';
import ContactPgpSettings from './ContactPgpSettings';

const { SEND_PGP_INLINE, SEND_PGP_MIME } = PACKAGE_TYPE;
const { TYPE_NO_RECEIVE } = RECIPIENT_TYPE;
const { KEY_GET_ADDRESS_MISSING, KEY_GET_DOMAIN_MISSING_MX, KEY_GET_INPUT_INVALID } = API_CUSTOM_ERROR_CODES;
const EMAIL_ERRORS = [KEY_GET_ADDRESS_MISSING, KEY_GET_DOMAIN_MISSING_MX, KEY_GET_INPUT_INVALID];
const { INCLUDE, IGNORE } = CATEGORIES;

const PGP_MAP = {
    [SEND_PGP_INLINE]: PGP_INLINE,
    [SEND_PGP_MIME]: PGP_MIME
};

const ContactEmailSettingsModal = ({ userKeysList, contactID, properties, emailProperty, ...rest }) => {
    const { value: Email, group: emailGroup } = emailProperty;
    const [loading, withLoading] = useLoading();
    const { createNotification } = useNotifications();
    const api = useApi();
    const { call } = useEventManager();
    const [model, setModel] = useState({ keys: { api: [], pinned: [] } });
    const [showPgpSettings, setShowPgpSettings] = useState(false);
    const [{ PGPScheme, Sign }, loadingMailSettings] = useMailSettings(); // NOTE MailSettings model needs to be loaded

    /**
     * Detect current scheme
     * @param {String} scheme
     * @returns {Boolean}
     */
    const hasScheme = (scheme) => {
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
            .filter(({ field, group }) => VCARD_KEY_FIELDS.includes(field) && group === emailGroup)
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
                { contactKeyPromises: [], mimeType: '', encrypt: false, scheme: '', sign: Sign === PGP_SIGN } // Default values
            );
        const contactKeys = (await Promise.all(contactKeyPromises)).filter(Boolean);
        const config = await getKeysFromApi(Email);
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

        const trustedFingerprints = contactKeys.map((publicKey) => publicKey.getFingerprint());
        setModel({
            mimeType,
            encrypt,
            scheme,
            sign,
            email: Email,
            keys: { api: apiKeys, pinned: contactKeys },
            trustedFingerprints,
            isPGPExternal: externalUser,
            isPGPExternalWithWKDKeys: externalUser && !!apiKeys.length,
            isPGPInternal: internalUser,
            pgpAddressDisabled: isDisabledUser(config),
            noPrimary: hasNoPrimary(unarmoredKeys, contactKeys),
            keysExpired,
            isPGPInline: externalUser && hasScheme('pgp-inline'),
            isPGPMime: externalUser && hasScheme('pgp-mime')
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
            value: `data:application/pgp-keys;base64,${encodeBase64(
                arrayToBinaryString(publicKey.toPacketlist().write())
            )}`,
            group,
            pref: `${index + 1}`
        });
        return [...model.keys.pinned, ...model.keys.api]
            .filter((publicKey) => model.trustedFingerprints.includes(publicKey.getFingerprint()))
            .map(toKeyProperty);
    };

    /**
     * Save send preferences
     * @returns {Promise}
     */
    const handleSubmit = async () => {
        const otherProperties = properties.filter(({ field, group }) => {
            return !['email', ...VCARD_KEY_FIELDS].includes(field) || (group && group !== emailGroup);
        });
        const emailProperties = [
            emailProperty,
            model.mimeType && { field: 'x-pm-mimetype', value: model.mimeType, group: emailGroup },
            model.isPGPExternal && model.encrypt && { field: 'x-pm-encrypt', value: 'true', group: emailGroup },
            model.isPGPExternal && model.sign && { field: 'x-pm-sign', value: 'true', group: emailGroup },
            model.isPGPExternal && model.scheme && { field: 'x-pm-scheme', value: model.scheme, group: emailGroup },
            ...getKeysProperties(emailGroup) // [{ field: 'key' }, ]
        ].filter(Boolean);
        const allProperties = otherProperties.concat(emailProperties);
        const Contacts = await prepareContacts([allProperties], userKeysList[0]);
        const labels = hasCategories(allProperties) ? INCLUDE : IGNORE;
        await api(addContacts({ Contacts, Overwrite: +!!contactID, Labels: labels }));
        await call();
        rest.onClose();
        createNotification({ text: c('Success').t`Preferences saved` });
    };

    useEffect(() => {
        if (!loadingMailSettings) {
            withLoading(prepare());
        }
    }, [loadingMailSettings]);

    useEffect(() => {
        const updateEncryptToggle = async (keys) => {
            const expired = await allKeysExpired(keys);
            if (expired || !keys.length) {
                setModel((model) => ({ ...model, encrypt: false, keysExpired: expired }));
            }
        };
        updateEncryptToggle(model.keys);
    }, [model.keys]);

    return (
        <FormModal
            loading={loading || loadingMailSettings}
            submit={c('Action').t`Save`}
            onSubmit={() => withLoading(handleSubmit())}
            title={c('Title').t`Email settings (${Email})`}
            {...rest}
        >
            <Alert>{c('Info')
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
                <LinkButton onClick={() => setShowPgpSettings(!showPgpSettings)}>
                    {showPgpSettings
                        ? c('Action').t`Hide advanced PGP settings`
                        : c('Action').t`Show advanced PGP settings`}
                </LinkButton>
            </div>
            {showPgpSettings ? <ContactPgpSettings model={model} setModel={setModel} /> : null}
        </FormModal>
    );
};

ContactEmailSettingsModal.propTypes = {
    userKeysList: PropTypes.array,
    contactID: PropTypes.string,
    properties: PropTypes.array,
    emailProperty: PropTypes.object.isRequired
};

export default ContactEmailSettingsModal;
