import React from 'react';
import { useContacts, Loader } from 'react-components';
import { Link } from 'react-router-dom';

const ContactsList = () => {
    const [contacts, loading] = useContacts();

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <ul className="unstyled">
                {contacts.map(({ ID, Name }) => {
                    return (
                        <li key={ID} className="p1 border-bottom">
                            <Link to={`/contacts/${ID}`}>{Name}</Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ContactsList;
