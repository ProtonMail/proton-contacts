import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { classnames, Checkbox, ContactGroupLabels } from 'react-components';
import { DENSITY } from 'proton-shared/lib/constants';

import { addPlus, getInitial } from 'proton-shared/lib/helpers/string';

import ItemCheckbox from './ItemCheckbox';

const ContactRow = ({ style, userSettings, contactID, hasPaidMail, contactGroupsMap, contact, onClick, onCheck }) => {
    const { ID, Name, LabelIDs = [], emails = [], isChecked } = contact;
    const isCompactView = userSettings.Density === DENSITY.COMPACT;

    const contactGroups = contact.LabelIDs.map((ID) => contactGroupsMap[ID]);

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
            style={style}
            key={ID}
            onClick={() => onClick(ID)}
            className={classnames([
                'item-container item-contact flex cursor-pointer bg-global-white',
                contactID === ID && 'item-is-selected',
            ])}
        >
            <div className="flex flex-nowrap w100 h100 mtauto mbauto flex-align-items-center">
                {isCompactView ? (
                    <Checkbox
                        className="item-icon-compact"
                        checked={isChecked}
                        onChange={onCheck}
                        labelOnClick={(event) => event.stopPropagation()}
                        data-contact-id={ID}
                        aria-describedby={ID}
                    />
                ) : (
                    <ItemCheckbox
                        checked={isChecked}
                        onChange={onCheck}
                        onClick={(event) => event.stopPropagation()}
                        data-contact-id={ID}
                    >
                        {getInitial(Name)}
                    </ItemCheckbox>
                )}

                <div className="flex-item-fluid pl1 flex flex-column flex-justify-space-between conversation-titlesender">
                    <div className="flex flex-nowrap flex-align-items-center item-firstline max-w100">
                        <div className={classnames(['flex flex-item-fluid w0', LabelIDs.length && 'pr1'])}>
                            <span className="text-bold inline-block max-w100 text-ellipsis" id={ID}>
                                {Name}
                            </span>
                        </div>
                        {hasPaidMail && contactGroups && <ContactGroupLabels contactGroups={contactGroups} />}
                    </div>
                    <div
                        className="flex flex-align-items-center item-secondline max-w100 text-ellipsis item-sender--smaller"
                        title={emails.join(', ')}
                    >
                        {emails.length ? (
                            addPlus(emails)
                        ) : (
                            <span className="placeholder">{c('Info').t`No email address`}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

ContactRow.propTypes = {
    userSettings: PropTypes.object,
    onClick: PropTypes.func,
    onCheck: PropTypes.func,
    style: PropTypes.object,
    contactID: PropTypes.string,
    hasPaidMail: PropTypes.bool,
    contactGroupsMap: PropTypes.object,
    contact: PropTypes.shape({
        ID: PropTypes.string,
        Name: PropTypes.string,
        LabelIDs: PropTypes.array,
        emails: PropTypes.array,
        isChecked: PropTypes.bool,
    }),
};

export default ContactRow;
