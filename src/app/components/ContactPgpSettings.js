import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { move } from 'proton-shared/lib/helpers/array';
import { Alert, Row, Label, Field, Info, Toggle, SelectKeyFiles, useNotifications } from 'react-components';

import ContactSchemeSelect from './ContactSchemeSelect';
import ContactKeysTable from './ContactKeysTable';

const ContactPgpSettings = ({ model, setModel }) => {
    const { createNotification } = useNotifications();
    const handleRemoveKey = (index) => {
        const copy = [...model.keys];
        copy.splice(index, 1);
        setModel({ ...model, keys: copy });
    };

    const handleMakePrimary = (index) => {
        setModel({ ...model, keys: move(model.keys, index, 0) });
    };

    const handleUploadKeys = (files) => {
        if (!files.length) {
            return createNotification({
                type: 'error',
                text: c('Error').t`Invalid private key file`
            });
        }

        setModel({
            ...model,
            keys: [
                ...model.keys,
                ...files.map((publicKey) => publicKey.armor()) // TODO update existing key if same fingerprint
            ]
        });
    };

    return (
        <>
            <Alert learnMore="TODO">{c('Info')
                .t`Setting up PGP allows you to send end-to-end encrypted emails with a non-Protonmail user that uses a PGP compatible service.`}</Alert>
            {model.isPGPInline ? (
                <Alert className="pgp-external-only pgp-inline-only">{c('Info')
                    .t`PGP/Inline is only compatible with Plain Text format. Please note that ProtonMail always signs PGP/Inline messages.`}</Alert>
            ) : null}
            {model.isPGPMime ? (
                <Alert className="pgp-external-only pgp-mime-only">{c('Info')
                    .t`PGP/MIME automatically sends the message using the current composer mode. Please note that ProtonMail always signs PGP/MIME messages.`}</Alert>
            ) : null}
            {model.isPgpExternal ? (
                <Row>
                    <Label>
                        {c('Label').t`Encrypt emails`}
                        <Info
                            className="ml0-5"
                            title={c('Tooltip')
                                .t`Email encryption forces email signature to help authentify your sent messages`}
                        />
                    </Label>
                    <Field>
                        <Toggle
                            checked={model.encrypt}
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
            ) : null}
            {model.isPgpExternal ? (
                <Row>
                    <Label>
                        {c('Label').t`Sign emails`}
                        <Info
                            className="ml0-5"
                            title={c('Tooltip')
                                .t`Digitally signing emails helps authentify that messages are sent by you`}
                        />
                    </Label>
                    <Field>
                        <Toggle
                            checked={model.sign}
                            onChange={({ target }) => setModel({ ...model, sign: target.checked })}
                        />
                    </Field>
                </Row>
            ) : null}
            <Row>
                <Label>
                    {c('Label').t`Trusted keys`}
                    <Info className="ml0-5" title={c('Tooltip').t`TODO`} />
                </Label>
                <Field>
                    <Toggle
                        checked={model.trust}
                        onChange={({ target }) => setModel({ ...model, trust: target.checked })}
                    />
                </Field>
            </Row>
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
                    <SelectKeyFiles onFiles={handleUploadKeys} multiple={true} />
                </Field>
            </Row>
            {model.keys.length ? (
                <ContactKeysTable
                    email={model.email}
                    publicKeys={model.keys}
                    onRemove={handleRemoveKey}
                    onMakePrimary={handleMakePrimary}
                />
            ) : null}
            {model.isPgpExternal ? (
                <Row>
                    <Label>
                        {c('Label').t`Cryptographic scheme`}
                        <Info
                            className="ml0-5"
                            title={c('Tooltip')
                                .t`Select the PGP scheme to be used when signing or encrypting to an user. Note that PGP/Inline forces plain text messages`}
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
