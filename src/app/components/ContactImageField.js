import React from 'react';
import PropTypes from 'prop-types';
import { Icon, SmallButton, useModals } from 'react-components';
import { c } from 'ttag';

import ContactImageModal from './ContactImageModal';

const ContactImageField = ({ value, onChange }) => {
    const { createModal } = useModals();
    const handleDelete = () => onChange('');

    const handleClick = () => {
        createModal(<ContactImageModal url={value} onSubmit={onChange} />);
    };

    return (
        <>
            <div className="mb1">{value ? <img src={value} /> : <Icon name="contact" size={40} />}</div>
            <div>
                <SmallButton className="mr1" onClick={handleClick}>{c('Action').t`Edit`}</SmallButton>
                {value ? <SmallButton onClick={handleDelete}>{c('Action').t`Clear`}</SmallButton> : null}
            </div>
        </>
    );
};

ContactImageField.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};

export default ContactImageField;
