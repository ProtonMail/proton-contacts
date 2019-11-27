import React from 'react';
import PropTypes from 'prop-types';
import { Icon, useUser, classnames } from 'react-components';

import { getFirstValue } from '../helpers/properties';
import { formatAdr } from '../helpers/property';

import ContactImageSummary from './ContactImageSummary';
import './ContactSummary.scss';

const ContactSummary = ({ properties, leftBlockWidth = 'w30' }) => {
    const [user] = useUser();
    const { hasPaidMail } = user;
    const photo = getFirstValue(properties, 'photo');
    const name = getFirstValue(properties, 'fn');
    const email = getFirstValue(properties, 'email');
    const tel = getFirstValue(properties, 'tel');
    const adr = getFirstValue(properties, 'adr');
    const org = getFirstValue(properties, 'org');

    const summary = [
        email && {
            icon: 'email',
            component: (
                <a href={`mailto:${email}`} title={email}>
                    {email}
                </a>
            )
        },
        hasPaidMail && tel && { icon: 'phone', component: <a href={`tel:${tel}`}>{tel}</a> },
        hasPaidMail && adr && { icon: 'address', component: formatAdr(adr) },
        hasPaidMail && org && { icon: 'organization', component: org }
    ].filter(Boolean);

    return (
        <div className="contactsummary-container flex flex-nowrap p1 mb1 border-bottom">
            <div className={classnames(['aligncenter contactsummary-photo-container', leftBlockWidth])}>
                <ContactImageSummary photo={photo} name={name} />
            </div>
            <div className="pl1">
                <h2 className="mb0-5 ellipsis">{name}</h2>
                <ul className="unstyled m0">
                    {summary.map(({ icon, component }) => {
                        return (
                            <li key={icon} className="flex flex-nowrap flex-items-center mb0-5">
                                <Icon name={icon} className="mr0-5" />
                                <span className="ellipsis">{component}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

ContactSummary.propTypes = {
    properties: PropTypes.array.isRequired,
    leftBlockWidth: PropTypes.string
};

export default ContactSummary;
