import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { Alert, Row, Label, Field, Info, Toggle, SelectKeyFiles, useNotifications } from 'react-components';

import ContactSchemeSelect from './ContactSchemeSelect';
import ContactKeysTable from './ContactKeysTable';

const ContactPgpSettings = ({ model, setModel }) => {
    const { createNotification } = useNotifications();

    const hasKeys = !!model.keys.pinned.length || !!model.keys.api.length;
    // API keys can never be all expired
    const hasAllKeysExpired = !model.keys.api.length && model.keysExpired;

    /**
     * Add / update keys to model
     * @param {Array<PublicKey>} files
     */
    const handleUploadKeys = (files) => {
        if (!files.length) {
            return createNotification({
                type: 'error',
                text: c('Error').t`Invalid public key file`
            });
        }

        // Update existing keys by looking on the fingerprint
        // And add new one
        const existingFingerprints = model.keys.pinned.map((publicKey) => publicKey.getFingerprint());
        const { toAdd, toUpdate } = files.reduce(
            (acc, publicKey) => {
                const fingerprint = publicKey.getFingerprint();

                if (existingFingerprints.includes(fingerprint)) {
                    acc.toUpdate.push(publicKey);
                    return acc;
                }

                acc.toAdd.push(publicKey);
                return acc;
            },
            { toAdd: [], toUpdate: [] }
        );

        const pinned = model.keys.pinned
            .map((publicKey) => {
                const fingerprint = publicKey.getFingerprint();
                const found = toUpdate.find((publicKey) => publicKey.getFingerprint() === fingerprint);
                return found ? found : publicKey;
            })
            .concat(toAdd);

        setModel({
            ...model,
            keys: { ...model.keys, pinned },
            trustedFingerprints: [...model.trustedFingerprints, ...toAdd.map((publicKey) => publicKey.getFingerprint())]
        });
    };

    return (
        <>
            <Alert learnMore="https://protonmail.com/support/knowledge-base/how-to-use-pgp/">{c('Info')
                .t`Setting up PGP allows you to send end-to-end encrypted emails with a non-Protonmail user that uses a PGP compatible service.`}</Alert>
            {model.isPGPInline && (
                <Alert>{c('Info')
                    .t`PGP/Inline is only compatible with Plain Text format. Please note that ProtonMail always signs PGP/Inline messages.`}</Alert>
            )}
            {model.isPGPMime && (
                <Alert>{c('Info')
                    .t`PGP/MIME automatically sends the message using the current composer mode. Please note that ProtonMail always signs PGP/MIME messages.`}</Alert>
            )}
            {!!model.keys.pinned.length && model.noPrimary && (
                <Alert type="warning">{c('Info')
                    .t`Address Verification with Trusted Keys is enabled for this address. To be able to send to this address, first trust public keys that can be used for sending.`}</Alert>
            )}
            {model.pgpAddressDisabled && (
                <Alert type="warning">{c('Info')
                    .t`This address is disabled. To be able to send to this address, the owner must first enable the address.`}</Alert>
            )}
            {!!model.keys.api.length && (
                <Alert learnMore="https://protonmail.com/support/knowledge-base/address-verification/">{c('Info')
                    .t`To use Address Verification, you must trust one or more available public keys, including the primary key for this address. This prevents the encrypted keys from being faked.`}</Alert>
            )}
            {model.isPGPExternal && !model.sign && (
                <Alert learnMore="https://protonmail.com/support/knowledge-base/how-to-use-pgp/">{c('Info')
                    .t`Only change these settings if you are using PGP with non-ProtonMail recipients.`}</Alert>
            )}
            {!model.keys.api.length && model.keysExpired && (
                <Alert type="warning" learnMore="https://protonmail.com/support/knowledge-base/how-to-use-pgp/">{c(
                    'Info'
                ).t`All uploaded keys are expired or revoked! Encryption is automatically disabled.`}</Alert>
            )}
            {model.isPGPExternal && (
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
                            disabled={!hasKeys || hasAllKeysExpired}
                            onChange={({ target }) =>
                                setModel({
                                    ...model,
                                    encrypt: target.checked,
                                    sign: target.checked ? true : model.sign,
                                    mimeType: ''
                                })
                            }
                        />
                    </Field>
                </Row>
            )}
            {model.isPGPExternal && (
                <Row>
                    <Label htmlFor="sign-toggle">
                        {c('Label').t`Sign emails`}
                        <Info
                            className="ml0-5"
                            title={c('Tooltip')
                                .t`Digitally signing emails helps authentify that messages are sent by you`}
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
                <Field>
                    {model.isPGPExternal ? <SelectKeyFiles onFiles={handleUploadKeys} multiple={true} /> : null}
                </Field>
            </Row>
            {hasKeys && <ContactKeysTable model={model} setModel={setModel} />}
            {model.isPGPExternal ? (
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
            ) : null}
        </>
    );
};

ContactPgpSettings.propTypes = {
    model: PropTypes.object,
    setModel: PropTypes.func
};

export default ContactPgpSettings;
