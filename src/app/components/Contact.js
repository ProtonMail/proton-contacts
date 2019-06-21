import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getContact } from 'proton-shared/lib/api/contacts';
import { useApi, Loader } from 'react-components';

import { prepareContact, bothUserKeys } from '../helpers/decrypt';
import ContactView from './ContactView';

const Contact = ({ contactID, userKeysList }) => {
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [{ properties, errors }, setModel] = useState({});
    const { publicKeys, privateKeys } = bothUserKeys(userKeysList);

    const request = async () => {
        try {
            setLoading(true);
            const { Contact } = await api(getContact(contactID));
            const { properties, errors } = await prepareContact(Contact, { publicKeys, privateKeys });
            setModel({ properties, errors });
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setModel({ ...model, errors: [FAIL_TO_LOAD] });
            throw error;
        }
    };

    useEffect(() => {
        if (Array.isArray(userKeysList)) {
            request();
        }
    }, [contactID, userKeysList]);

    if (loading) {
        return <Loader />;
    }

    return <ContactView properties={properties} contactID={contactID} errors={errors} />;
};

Contact.propTypes = {
    contactID: PropTypes.string.isRequired,
    userKeysList: PropTypes.array
};

export default Contact;
