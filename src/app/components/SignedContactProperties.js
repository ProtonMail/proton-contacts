import React from 'react';
import PropTypes from 'prop-types';
import { Bordered } from 'react-components';
import ContactViewProperty from './ContactViewProperty';

const SignedContactProperties = ({ contact }) => {
    const { email: emails = [] } = contact;

    return (
        <Bordered>
            {emails.map((property, index) => {
                return <ContactViewProperty first={!index} key={index.toString()} field="email" property={property} />;
            })}
        </Bordered>
    );
};

SignedContactProperties.propTypes = {
    contact: PropTypes.object
};

export default SignedContactProperties;
