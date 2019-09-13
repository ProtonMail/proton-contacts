import React from 'react';
import PropTypes from 'prop-types';

import { addPlus, getInitial } from 'proton-shared/lib/helpers/string';

import ItemCheckbox from './ItemCheckbox';
import ContactGroupIcon from './ContactGroupIcon';

const ContactRow = ({ style, contactID, hasPaidMail, contactGroupsMap, contact, onClick, onCheck, onStop }) => {
    const { ID, Name, LabelIDs = [], emails = [], isChecked } = contact;

    return (
        <div
            style={style}
            key={ID}
            onClick={onClick(ID)}
            className={`item-container bg-global-white  ${contactID === ID ? 'item-is-selected' : ''}`}
        >
            <div className="flex flex-nowrap">
                <span onClick={onStop}>
                    <ItemCheckbox
                        checked={isChecked}
                        className="item-checkbox sr-only"
                        onChange={onCheck}
                        data-contact-id={ID}
                    >
                        {getInitial(Name)}
                    </ItemCheckbox>
                </span>
                <div className="flex-item-fluid pl1 flex flex-column flex-spacebetween conversation-titlesender">
                    <div className="flex">
                        <div className={`flex-item-fluid w0 ${LabelIDs.length ? 'pr1' : ''}`}>
                            <span className="bold inbl mw100 ellipsis">{Name}</span>
                        </div>
                        {hasPaidMail && LabelIDs.length ? (
                            <div>
                                {LabelIDs.map((labelID) => {
                                    const { Color, Name } = contactGroupsMap[labelID];
                                    return (
                                        <ContactGroupIcon
                                            scrollContainerClass="contacts-list"
                                            key={labelID}
                                            name={Name}
                                            color={Color}
                                        />
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                    <div className="mw100 ellipsis" title={emails.join(', ')}>
                        {addPlus(emails)}
                    </div>
                </div>
            </div>
        </div>
    );
};

ContactRow.propTypes = {
    style: PropTypes.object,
    contactID: PropTypes.string,
    hasPaidMail: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    contactGroupsMap: PropTypes.object,
    contact: PropTypes.shape({
        ID: PropTypes.string,
        Name: PropTypes.string,
        LabelIDs: PropTypes.array,
        emails: PropTypes.array,
        isChecked: PropTypes.bool
    }),
    onStop: PropTypes.func
};

export default ContactRow;
