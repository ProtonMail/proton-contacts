import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormModal, Alert, Row, Label, Field, Select, Info, LinkButton } from 'react-components';
import { c } from 'ttag';

const PgpSettings = () => {
    return (
        <>
            <Alert learnMore="TODO">{c('Info')
                .t`Setting up PGP allows you to send end-to-end encrypted emails with a non-Protonmail user that uses a PGP compatible service.`}</Alert>
            <Row>
                <Label>
                    {c('Label').t`Encrypt emails`}
                    <Info
                        className="ml1"
                        title={c('Tooltip')
                            .t`Email encryption forces email signature to help authentify your sent messages`}
                    />
                </Label>
            </Row>
            <Row>
                <Label>
                    {c('Label').t`Sign emails`}
                    <Info
                        className="ml1"
                        title={c('Tooltip').t`Digitally signing emails helps authentify that messages are sent by you`}
                    />
                </Label>
            </Row>
            <Row>
                <Label>
                    {c('Label').t`Public keys`}
                    <Info
                        className="ml1"
                        title={c('Tooltip')
                            .t`Upload a public key to enable sending end-to-end encrypted emails to this email`}
                    />
                </Label>
            </Row>
            <Row>
                <Label>
                    {c('Label').t`Cryptographic scheme`}
                    <Info
                        className="ml1"
                        title={c('Tooltip')
                            .t`Select the PGP scheme to be used when signing or encrypting to an user. Note that PGP/Inline forces plain text messages`}
                    />
                </Label>
            </Row>
        </>
    );
};

const ContactEmailSettingsModal = ({ properties, contactEmail, ...rest }) => {
    const options = [];
    const [model, setModel] = useState({});
    const handleChangeEmailFormat = ({ target }) => setModel({ ...model, emailFormat: target.value });
    const handleSubmit = () => {};
    const handleTogglePgpSettings = () => setModel({ ...model, showPgpSettings: !model.showPgpSettings });
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
                        className="ml1"
                        title={c('Tooltip')
                            .t`Automatic indicates that the format in the composer is used to send to this user. Plain text indicates that the message will always be converted to plain text on send.`}
                    />
                </Label>
                <Field>
                    <Select value={model.emailFormat} options={options} onChange={handleChangeEmailFormat} />
                </Field>
            </Row>
            <div className="mb1">
                <LinkButton onClick={handleTogglePgpSettings}>
                    {model.showPgpSettings
                        ? c('Action').t`Hide advanced PGP settings`
                        : c('Action').t`Show advanced PGP settings`}
                </LinkButton>
            </div>
            {model.showPgpSettings ? <PgpSettings /> : null}
        </FormModal>
    );
};

ContactEmailSettingsModal.propTypes = {
    properties: PropTypes.array,
    contactEmail: PropTypes.object.isRequired
};

export default ContactEmailSettingsModal;
