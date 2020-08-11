import React from 'react';
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
        <div
            style={style}
            key={ID}
            onClick={() => onClick(ID)}
            className={classnames([
                'item-container item-contact flex cursor-pointer bg-global-white',
                contactID === ID && 'item-is-selected'
            ])}
        >
            <div className="flex flex-nowrap w100 mtauto mbauto flex-items-center">
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

                <div className="flex-item-fluid pl1 flex flex-column flex-spacebetween conversation-titlesender">
                    <div className="flex flex-nowrap flex-items-center item-firstline mw100">
                        <div className={classnames(['flex flex-item-fluid w0', LabelIDs.length && 'pr1'])}>
                            <span className="bold inbl mw100 ellipsis" id={ID}>
                                {Name}
                            </span>
                        </div>
                        {hasPaidMail && contactGroups && <ContactGroupLabels contactGroups={contactGroups} />}
                    </div>
                    <div
                        className="flex flex-items-center item-secondline mw100 ellipsis item-sender--smaller"
                        title={emails.join(', ')}
                    >
                        {addPlus(emails)}
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
        isChecked: PropTypes.bool
    })
};

export default ContactRow;
