import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert, Row, Label, Field, Info, Toggle, SelectKeyFiles, useNotifications } from 'react-components';
import { getKeyEncryptStatus } from '../helpers/pgp';

import ContactSchemeSelect from './ContactSchemeSelect';
import ContactKeysTable from './ContactKeysTable';

const ContactPgpSettings = ({ model, setModel }) => {
    const { createNotification } = useNotifications();
    const hasApiKeys = !!model.keys.api.length;
    const hasPinnedKeys = !!model.keys.pinned.length;

    /**
     * Add / update keys to model
     * @param {Array<PublicKey>} files
     */
    const handleUploadKeys = async (files) => {
        if (!files.length) {
            return createNotification({
                type: 'error',
                text: c('Error').t`Invalid public key file`
            });
        }
        const pinned = [...model.keys.pinned];
        const trustedFingerprints = new Set([...model.trustedFingerprints]);
        const revokedFingerprints = new Set([...model.revokedFingerprints]);
        const expiredFingerprints = new Set([...model.expiredFingerprints]);

        await Promise.all(
            files.map(async (publicKey) => {
                const fingerprint = publicKey.getFingerprint();
                const { isExpired, isRevoked } = await getKeyEncryptStatus(publicKey);
                isExpired && expiredFingerprints.add(fingerprint);
                isRevoked && revokedFingerprints.add(fingerprint);
                if (!trustedFingerprints.has(fingerprint)) {
                    trustedFingerprints.add(fingerprint);
                    return pinned.push(publicKey);
                }
                const indexFound = pinned.findIndex((publicKey) => publicKey.getFingerprint() === fingerprint);
                return pinned.splice(indexFound, 1, publicKey);
            })
        );

        setModel({
            ...model,
            keys: { ...model.keys, pinned },
            trustedFingerprints,
            expiredFingerprints,
            revokedFingerprints
        });
    };

    return (
        <>
            {!hasApiKeys && (
                <Alert learnMore="https://protonmail.com/support/knowledge-base/how-to-use-pgp/">
                    {c('Info')
                        .t`Setting up PGP allows you to send end-to-end encrypted emails with a non-Protonmail user that uses a PGP compatible service.`}
                </Alert>
            )}
            {!!model.keys.pinned.length && model.noPrimary && (
                <Alert type="warning">{c('Info')
                    .t`Address Verification with Trusted Keys is enabled for this address. To be able to send to this address, first trust public keys that can be used for sending.`}</Alert>
            )}
            {model.pgpAddressDisabled && (
                <Alert type="warning">{c('Info')
                    .t`This address is disabled. To be able to send to this address, the owner must first enable the address.`}</Alert>
            )}
            {hasApiKeys && (
                <Alert learnMore="https://protonmail.com/support/knowledge-base/address-verification/">{c('Info')
                    .t`To use Address Verification, you must trust one or more available public keys, including the primary key for this address. This prevents the encrypted keys from being faked.`}</Alert>
            )}
            {!hasApiKeys && !model.sign && (
                <Alert learnMore="https://protonmail.com/support/knowledge-base/how-to-use-pgp/">{c('Info')
                    .t`Only change these settings if you are using PGP with non-ProtonMail recipients.`}</Alert>
            )}
            {model.isPGPExternalWithoutWKDKeys && model.noPinnedKeyCanSend && (
                <Alert type="error" learnMore="https://protonmail.com/support/knowledge-base/how-to-use-pgp/">{c('Info')
                    .t`All uploaded keys are expired or revoked! Encryption is automatically disabled.`}</Alert>
            )}
            {!hasApiKeys && (
                <Row>
                    <Label htmlFor="encrypt-toggle">
                        {c('Label').t`Encrypt emails`}
                        <Info
                            className="ml0-5"
                            title={c('Tooltip')
                                .t`Email encryption forces email signature to help authenticate your sent messages`}
                        />
                    </Label>
                    <Field>
                        <Toggle
                            id="encrypt-toggle"
                            checked={model.encrypt}
                            disabled={!model.keys.pinned.length || model.noPinnedKeyCanSend}
                            onChange={({ target }) =>
                                setModel({
                                    ...model,
                                    encrypt: target.checked,
                                    sign: target.checked ? true : model.sign
                                })
                            }
                        />
                    </Field>
                </Row>
            )}
            {!hasApiKeys && (
                <Row>
                    <Label htmlFor="sign-toggle">
                        {c('Label').t`Sign emails`}
                        <Info
                            className="ml0-5"
                            title={c('Tooltip')
                                .t`Digitally signing emails helps authenticating that messages are sent by you`}
                        />
                    </Label>
                    <Field>
                        <Toggle
                            id="sign-toggle"
                            checked={model.sign}
                            disabled={model.encrypt}
                            onChange={({ target }) =>
                                setModel({
                                    ...model,
                                    sign: target.checked,
                                    mimeType: ''
                                })
                            }
                        />
                    </Field>
                </Row>
            )}
            <Row>
                <Label>
                    {c('Label').t`Public keys`}
                    <Info
                        className="ml0-5"
                        title={c('Tooltip')
                            .t`Upload a public key to enable sending end-to-end encrypted emails to this email`}
                    />
                </Label>
                <Field className="onmobile-mt0-5">
                    {model.isPGPExternal && <SelectKeyFiles onFiles={handleUploadKeys} multiple={true} />}
                </Field>
            </Row>
            {(hasApiKeys || hasPinnedKeys) && <ContactKeysTable model={model} setModel={setModel} />}
            {!hasApiKeys && (
                <Row>
                    <Label>
                        {c('Label').t`Cryptographic scheme`}
                        <Info
                            className="ml0-5"
                            title={c('Tooltip')
                                .t`Select the PGP scheme to be used when signing or encrypting to a user. Note that PGP/Inline forces plain text messages`}
                        />
                    </Label>
                    <Field>
                        <ContactSchemeSelect
                            value={model.scheme}
                            onChange={(scheme) => setModel({ ...model, scheme })}
                        />
                    </Field>
                </Row>
            )}
        </>
    );
};

ContactPgpSettings.propTypes = {
    model: PropTypes.object,
    setModel: PropTypes.func
};

export default ContactPgpSettings;
