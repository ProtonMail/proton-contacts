import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLoading, Loader } from 'react-components';

import useContact from '../hooks/useContact';
import { prepareContact, bothUserKeys } from '../helpers/decrypt';
import ContactView from './ContactView';

const Contact = ({ contactID, userKeysList }) => {
    const [decrypting, withLoading] = useLoading(true);
    const [model, setModel] = useState({ properties: [], errors: [] });
    const { properties, errors } = model;
    const { publicKeys, privateKeys } = bothUserKeys(userKeysList);
    const [contact, contactLoading, contactFetchError] = useContact(contactID);

    const decryptContact = async () => {
        const { properties, errors } = await prepareContact(contact, { publicKeys, privateKeys });
        setModel({ properties, errors });
    };

    useEffect(() => {
        if (contact && Array.isArray(userKeysList)) {
            withLoading(decryptContact());
        }
    }, [contact, userKeysList]);

    if (contactFetchError) {
        return 'TODO: Error';
    }

    if (contactLoading || decrypting) {
        return <Loader />;
    }

    return <ContactView properties={properties} contactID={contactID} errors={errors} />;
};

Contact.propTypes = {
    contactID: PropTypes.string.isRequired,
    userKeysList: PropTypes.array
};

export default Contact;
