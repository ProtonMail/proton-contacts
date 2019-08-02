import React from 'react';
import PropTypes from 'prop-types';
import { Icon, RemoteImage } from 'react-components';
import { getInitial } from 'proton-shared/lib/helpers/string';

import { formatAdr } from '../helpers/property';

const getFirstValue = (properties, field) => {
    const { value } = properties.find(({ field: f }) => f === field) || {};
    return Array.isArray(value) ? value.join(', ') : value;
};

const ContactSummary = ({ properties }) => {
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
        tel && { icon: 'phone', component: <a href={`tel:${tel}`}>{tel}</a> },
        adr && { icon: 'address', component: formatAdr(adr) },
        org && { icon: 'organization', component: org }
    ].filter(Boolean);

    return (
        <div className="bg-global-light flex flex-nowrap p1 mb1 border-bottom">
            <div className="w20 aligncenter">
                {photo ? (
                    <RemoteImage src={photo} className="rounded50" />
                ) : (
                    <div className="rounded50 bordered bg-white ratio-container-square h1 mb0">
                        <span className="inner-ratio-container flex">
                            <span className="mauto color-global-border">{getInitial(name)}</span>
                        </span>
                    </div>
                )}
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
    properties: PropTypes.array.isRequired
};

export default ContactSummary;
