import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'react-components';
import { splitKeys } from 'proton-shared/lib/keys/keys';
import { prepareContact } from 'proton-shared/lib/contacts/decrypt';

import useContact from '../hooks/useContact';
import ContactView from './ContactView';

const Contact = ({ contactID, contactEmails, contactGroupsMap, ownAddresses, userKeysList = [] }) => {
    const [model, setModel] = useState({ ID: contactID });
    const ref = useRef(contactID);
    const [contact, contactLoading] = useContact(contactID);

    useEffect(() => {
        if (contact && userKeysList.length) {
            ref.current = contact.ID;
            const { publicKeys, privateKeys } = splitKeys(userKeysList);

            prepareContact(contact, { publicKeys, privateKeys }).then(({ properties, errors }) => {
                if (ref.current !== contact.ID) {
                    return;
                }
                setModel({ ID: contact.ID, properties, errors });
            });
        }
    }, [contact, userKeysList]);

    const { properties, errors, ID } = model;

    if (contactLoading || !properties || ID !== contactID) {
        return <Loader />;
    }

    return (
        <ContactView
            properties={properties}
            contactID={contactID}
            contactEmails={contactEmails}
            contactGroupsMap={contactGroupsMap}
            ownAddresses={ownAddresses}
            userKeysList={userKeysList}
            errors={errors}
        />
    );
};

Contact.propTypes = {
    contactID: PropTypes.string.isRequired,
    contactEmails: PropTypes.arrayOf(PropTypes.object),
    contactGroupsMap: PropTypes.object,
    userKeysList: PropTypes.array
};

export default Contact;
