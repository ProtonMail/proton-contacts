import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader, GenericError } from 'react-components';

import useContact from '../hooks/useContact';
import { prepareContact, bothUserKeys } from '../helpers/decrypt';
import ContactView from './ContactView';

const Contact = ({ contactID, userKeysList }) => {
    const [model, setModel] = useState({ ID: contactID });
    const ref = useRef(contactID);
    const [contact, contactLoading, contactFetchError] = useContact(contactID);

    useEffect(() => {
        if (contact && Array.isArray(userKeysList)) {
            ref.current = contact.ID;
            const { publicKeys, privateKeys } = bothUserKeys(userKeysList);

            prepareContact(contact, { publicKeys, privateKeys }).then(({ properties, error }) => {
                if (ref.current !== contact.ID) {
                    return;
                }
                setModel({ ID: contact.ID, properties, error });
            });
        }
    }, [contact, userKeysList]);

    if (contactFetchError) {
        return <GenericError />;
    }

    const { properties, errors, ID } = model;

    if (contactLoading || !properties || ID !== contactID) {
        return <Loader />;
    }

    return <ContactView properties={properties} contactID={contactID} errors={errors} />;
};

Contact.propTypes = {
    contactID: PropTypes.string.isRequired,
    userKeysList: PropTypes.array
};

export default Contact;
