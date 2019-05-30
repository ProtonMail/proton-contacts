import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-components';
import { addPlus } from 'proton-shared/lib/helpers/string';

const getFirstValue = (contact, key) => {
    if (!contact[key]) {
        return '';
    }

    if (Array.isArray(contact[key])) {
        const [{ values = [] } = {}] = contact[key];
        return addPlus(values);
    }

    return addPlus(contact[key].values);
};

const ContactSummary = ({ contact }) => {
    const fn = getFirstValue(contact, 'fn');
    const email = getFirstValue(contact, 'email');
    const tel = getFirstValue(contact, 'tel');
    const adr = getFirstValue(contact, 'adr');
    const org = getFirstValue(contact, 'org');
    const note = getFirstValue(contact, 'note');

    const summary = [
        email && { icon: 'email', text: email, isEmail: true },
        tel && { icon: 'phone', text: tel },
        adr && { icon: 'address', text: adr },
        org && { icon: 'organization', text: org },
        note && { icon: 'note', text: note }
    ].filter(Boolean);

    return (
        <div className="bg-global-light flex">
            <div>Photo</div>
            <div>
                <h1>{fn}</h1>
                <ul className="unstyled">
                    {summary.map(({ icon, text, isEmail }) => {
                        return (
                            <li key={icon}>
                                <Icon name={icon} />
                                {isEmail ? <a href={`mailto:${text}`}>{text}</a> : <span>{text}</span>}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

ContactSummary.propTypes = {
    contact: PropTypes.object
};

export default ContactSummary;
