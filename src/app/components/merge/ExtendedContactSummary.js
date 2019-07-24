import React from 'react';
import PropTypes from 'prop-types';
import { Block, Icon } from 'react-components';

import { formatAdr } from '../../helpers/property';
import { addPref, sortByPref } from '../../helpers/properties';

const getFirstValue = (properties, field) => {
    const { value } = properties.find(({ field: f }) => f === field) || {};
    return Array.isArray(value) ? value.join(', ') : value;
};

const getAllValues = (properties, field) => {
    return addPref(properties)
        .reduce((acc, { field: f, pref, value }) => {
            const stdValue = Array.isArray(value) ? value.join(', ') : value;
            f === field && acc.push({ value: stdValue, pref });
            return acc;
        }, [])
        .sort(sortByPref)
        .map(({ value }) => value);
};

const ExtendedContactSummary = ({ properties, hasPaidMail }) => {
    const name = getFirstValue(properties, 'fn');
    const emails = getAllValues(properties, 'email');
    const tels = getAllValues(properties, 'tel');
    const adrs = getAllValues(properties, 'adr');
    const orgs = getAllValues(properties, 'org');
    const notes = getAllValues(properties, 'note');

    const summary = [
        [{ prop: 'Name', icon: 'contact', component: name }],
        emails.length &&
            emails.map((email) => ({
                prop: 'Email',
                icon: 'email',
                component: <a href={`mailto:${email}`}>{email}</a>
            })),
        tels.length &&
            tels.map((tel) => ({ prop: 'Phone', icon: 'phone', component: <a href={`tel:${tel}`}>{tel}</a> })),
        adrs.length && adrs.map((adr) => ({ prop: 'Address', icon: 'address', component: formatAdr(adr) })),
        orgs.length && orgs.map((org) => ({ prop: 'Organization', icon: 'organization', component: org })),
        notes.length && notes.map((note) => ({ prop: 'Note', icon: 'note', component: note }))
    ].filter(Boolean);

    return (
        <Block className="flex flex-spacebetween flex-nowrap">
            <div className="flex flex-column">
                {summary.map((items) => (
                    <div key={items[0].prop} className="mb1">
                        {items.map(({ prop, icon }, index) => (
                            <div key={`icon-${index}`} className="flex flex-items-center">
                                <Icon name={icon} className={`mr0-5 ${index ? 'nonvisible' : ''}`} />
                                <span>{prop}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex flex-column">
                {summary.map((items) => (
                    <div key={items[0].prop} className="mb1">
                        {items.map(({ component }, index) => (
                            <div key={`icon-${index}`} className="flex flex-items-center">
                                {component}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Block>
    );
};

ExtendedContactSummary.propTypes = {
    properties: PropTypes.array.isRequired,
    hasPaidMail: PropTypes.number
};

ExtendedContactSummary.defaultProps = {
    properties: []
};

export default ExtendedContactSummary;
