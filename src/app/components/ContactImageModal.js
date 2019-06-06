import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { FormModal, Row, Label, Field, FileInput, Input, useNotifications } from 'react-components';
import { resizeImage } from 'proton-shared/lib/helpers/image';
import { CONTACT_IMG_SIZE } from '../constants';

const ContactImageModal = ({ url: initialUrl, onSubmit, onClose, ...rest }) => {
    const [url, setUrl] = useState(initialUrl);
    const { createNotification } = useNotifications();
    const handleChange = ({ target }) => setUrl(target.value);

    const handleSubmit = () => {
        onSubmit(url);
        onClose();
    };

    const handleUpload = ({ target }) => {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onloadend = async () => {
            try {
                const base64str = await resizeImage(reader.result, CONTACT_IMG_SIZE, 'image/jpeg', 0.7);
                onSubmit(base64str);
                onClose();
            } catch (error) {
                createNotification({ text: c('Error').t`Image upload failed`, type: 'error' });
                throw error;
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <FormModal onSubmit={handleSubmit} submit={c('Action').t`Save`} onClose={onClose} {...rest}>
            <Row>
                <Label htmlFor="contactImageModal-input-url">{c('Label').t`Add image URL`}</Label>
                <Field>
                    <Input
                        id="contactImageModal-input-url"
                        value={url}
                        onChange={handleChange}
                        placeholder={c('Placeholder').t`Image URL`}
                    />
                </Field>
            </Row>
            <Row>
                <Label htmlFor="contactImageModal-input-file">{c('Label').t`Upload picture`}</Label>
                <Field>
                    <FileInput id="contactImageModal-input-file" accept="image/*" onChange={handleUpload}>{c('Action')
                        .t`Upload picture`}</FileInput>
                </Field>
            </Row>
        </FormModal>
    );
};

ContactImageModal.propTypes = {
    url: PropTypes.string,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func
};

ContactImageModal.defaultProps = {
    url: ''
};

export default ContactImageModal;
