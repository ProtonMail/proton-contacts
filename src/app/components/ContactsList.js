import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'react-components';
import { Link } from 'react-router-dom';

const ContactsList = ({ contacts, onCheck }) => {
    const handleCheck = ({ target }) => {
        const contactID = target.getAttribute('data-contact-id');
        onCheck(contactID, target.checked);
    };

    return (
        <div>
            <ul className="unstyled">
                {contacts.map(({ ID, Name, emails, isChecked }) => {
                    return (
                        <li key={ID} className="p1 border-bottom flex">
                            <div>
                                <Checkbox checked={isChecked} onChange={handleCheck} data-contact-id={ID} />
                            </div>
                            <div>
                                <Link to={`/contacts/${ID}`}>
                                    {Name} {emails.join(', ')}
                                </Link>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

ContactsList.propTypes = {
    contacts: PropTypes.array,
    onCheck: PropTypes.func
};

export default ContactsList;
