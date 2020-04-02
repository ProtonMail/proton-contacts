import React from 'react';
import PropTypes from 'prop-types';
import { Block, Icon, classnames } from 'react-components';

import { formatAdr } from 'proton-shared/lib/contacts/property';
import { getPreferredValue, getAllValues } from 'proton-shared/lib/contacts/properties';
import UpsellFree from '../../components/UpsellFree';

const MergedContactSummary = ({ properties = [], hasPaidMail }) => {
    const name = getPreferredValue(properties, 'fn');
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
        hasPaidMail &&
            tels.length &&
            tels.map((tel) => ({ prop: 'Phone', icon: 'phone', component: <a href={`tel:${tel}`}>{tel}</a> })),
        hasPaidMail &&
            adrs.length &&
            adrs.map((adr) => ({ prop: 'Address', icon: 'address', component: formatAdr(adr) })),
        hasPaidMail &&
            orgs.length &&
            orgs.map((org) => ({ prop: 'Organization', icon: 'organization', component: org })),
        hasPaidMail && notes.length && notes.map((note) => ({ prop: 'Note', icon: 'note', component: note }))
    ].filter(Boolean);

    return (
        <>
            <Block className="flex flex-nowrap">
                <div className="flex flex-column flex-nowrap mr2">
                    {summary.map((items) => (
                        <div key={items[0].prop} className="mb1">
                            {items.map(({ prop, icon }, index) => (
                                <div key={`icon-${index}`} className="flex flex-items-center flex-nowrap">
                                    <Icon
                                        name={icon}
                                        className={classnames(['mr0-5 flex-item-noshrink', index && 'nonvisible'])}
                                    />
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
                                <div key={`icon-${index}`} className="flex flex-items-center mw100 ellipsis">
                                    {component}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Block>
            {!hasPaidMail && !![...tels, ...adrs, ...orgs, ...notes].length && (
                <Block>
                    <UpsellFree />
                </Block>
            )}
        </>
    );
};

MergedContactSummary.propTypes = {
    properties: PropTypes.array,
    hasPaidMail: PropTypes.bool
};

export default MergedContactSummary;
