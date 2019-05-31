import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-components';
import { addPlus } from 'proton-shared/lib/helpers/string';
import { getFirstValues } from '../helpers/property';

const ContactSummary = ({ contact }) => {
    const photo = getFirstValues(contact, 'photo')[0];
    const name = getFirstValues(contact, 'fn').join(', ');
    const email = addPlus(getFirstValues(contact, 'email'));
    const tel = addPlus(getFirstValues(contact, 'tel'));
    const adr = addPlus(getFirstValues(contact, 'adr'));
    const org = addPlus(getFirstValues(contact, 'org'));
    const note = addPlus(getFirstValues(contact, 'note'));

    const summary = [
        email && { icon: 'email', component: <a href={`mailto:${email}`}>{email}</a> },
        tel && { icon: 'phone', component: <a href={`mailto:${tel}`}>{tel}</a> },
        adr && {
            icon: 'address',
            component: adr
                .split(',')
                .filter(Boolean)
                .join(', ')
        },
        org && { icon: 'organization', component: org },
        note && { icon: 'note', component: note }
    ].filter(Boolean);

    return (
        <div className="bg-global-light flex flex-nowrap p1 mb1 border-bottom">
            <div className="w20 aligncenter">
                {photo ? <img src={photo} className="rounded50" /> : <Icon name="contact" size={40} />}
            </div>
            <div className="pl1">
                <h2 className="mb0-5">{name}</h2>
                <ul className="unstyled m0">
                    {summary.map(({ icon, component }) => {
                        return (
                            <li key={icon} className="flex flex-items-center mb0-5">
                                <Icon name={icon} className="mr0-5" />
                                {component}
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
