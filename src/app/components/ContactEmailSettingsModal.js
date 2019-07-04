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
                    <Info />
                </Label>
            </Row>
            <Row>
                <Label>
                    {c('Label').t`Sign emails`}
                    <Info />
                </Label>
            </Row>
            <Row>
                <Label>
                    {c('Label').t`Public keys`}
                    <Info />
                </Label>
            </Row>
            <Row>
                <Label>
                    {c('Label').t`Cryptographic scheme`}
                    <Info />
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
                    <Info />
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
