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
import { noop } from 'proton-shared/lib/helpers/function';
import { addContacts } from 'proton-shared/lib/api/contacts';
import { getPublicKeysEmailHelper } from 'proton-shared/lib/api/helpers/publicKeys';
import { VCARD_KEY_FIELDS, PGP_INLINE, PGP_MIME, PGP_SIGN, CATEGORIES } from '../constants';
import { PACKAGE_TYPE, MIME_TYPES } from 'proton-shared/lib/constants';

import ContactMIMETypeSelect from './ContactMIMETypeSelect';
import ContactPgpSettings from './ContactPgpSettings';

const { SEND_PGP_INLINE, SEND_PGP_MIME } = PACKAGE_TYPE;
const { INCLUDE, IGNORE } = CATEGORIES;
const { PLAINTEXT } = MIME_TYPES;

const PGP_MAP = {
    [SEND_PGP_INLINE]: PGP_INLINE,
    [SEND_PGP_MIME]: PGP_MIME
};

const ContactEmailSettingsModal = ({ userKeysList, contactID, properties, emailProperty, ...rest }) => {
    const api = useApi();
    const { call } = useEventManager();
    const [loading, withLoading] = useLoading();
    const { createNotification } = useNotifications();
    const [{ PGPScheme, Sign }, loadingMailSettings] = useMailSettings(); // NOTE MailSettings model needs to be loaded
    const [showPgpSettings, setShowPgpSettings] = useState(false);

    const { value: Email, group: emailGroup } = emailProperty;
    const [model, setModel] = useState({ keys: [] });
    const isMimeTypeFixed = model.isPGPExternal && model.sign;

    const hasPGPInline = () => (model.scheme || PGP_MAP[PGPScheme]) === PGP_INLINE;

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
        const config = await getPublicKeysEmailHelper(api, Email);
        const internalUser = isInternalUser(config);
        const externalUser = !internalUser;
        const apiKeys = config.publicKeys;
        const [unarmoredKeys, keysExpired] = await Promise.all([
            getRawInternalKeys(config),
            allKeysExpired(contactKeys)
        ]);

        const trustedFingerprints = internalUser ? contactKeys.map((publicKey) => publicKey.getFingerprint()) : [];
        setModel({
            mimeType,
            encrypt,
            scheme,
            sign,
            email: Email,
            keys: internalUser && !contactKeys.length ? apiKeys : contactKeys,
            trustedFingerprints,
            isPGPExternal: externalUser,
            isPGPInternal: internalUser,
            pgpAddressDisabled: isDisabledUser(config),
            noPrimary: hasNoPrimary(unarmoredKeys, contactKeys),
            keysExpired
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

        if (model.isPGPExternal) {
            return model.keys.map(toKeyProperty);
        }

        return model.keys
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

    useEffect(() => {
        if (!isMimeTypeFixed) {
            return;
        }
        // PGP/Inline should force the email format to plaintext
        if (hasPGPInline()) {
            setModel((model) => ({ ...model, mimeType: PLAINTEXT }));
        }
    }, [isMimeTypeFixed, model.scheme]);

    return (
        <FormModal
            loading={loading || loadingMailSettings}
            submit={c('Action').t`Save`}
            onSubmit={() => withLoading(handleSubmit())}
            title={c('Title').t`Email settings (${Email})`}
            {...rest}
        >
            {!isMimeTypeFixed ? (
                <Alert>
                    {c('Info')
                        .t`Select the email format you want to be used by default when sending an email to this email address.`}
                </Alert>
            ) : hasPGPInline() ? (
                <Alert>
                    {c('Info')
                        .t`PGP/Inline is only compatible with Plain Text format. Please note that ProtonMail always signs PGP/Inline messages.`}
                </Alert>
            ) : (
                <Alert>
                    {c('Info')
                        .t`PGP/MIME automatically sends the message using the current composer mode. Please note that ProtonMail always signs PGP/MIME messages.`}
                </Alert>
            )}
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
                        disabled={isMimeTypeFixed}
                        value={model.mimeType}
                        onChange={(mimeType) => setModel({ ...model, mimeType })}
                    />
                </Field>
            </Row>
            <div className="mb1">
                <LinkButton
                    onClick={() => setShowPgpSettings(!showPgpSettings)}
                    disabled={loading || loadingMailSettings}
                >
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
