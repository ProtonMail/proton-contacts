import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, useContactGroups } from 'react-components';
import { withRouter } from 'react-router';
import { addPlus, getInitial } from 'proton-shared/lib/helpers/string';

import ContactGroupIcon from './ContactGroupIcon';

const ContactsList = ({ contacts, onCheck, history, selectedContactID }) => {
    const [contactGroups] = useContactGroups();
    const mapContactGroups = contactGroups.reduce((acc, contactGroup) => {
        acc[contactGroup.ID] = contactGroup;
        return acc;
    }, Object.create(null));

    const handleCheck = ({ target }) => {
        const contactID = target.getAttribute('data-contact-id');
        onCheck(contactID, target.checked);
    };

    const handleClick = (ID) => () => history.push(`/contacts/${ID}`);

    return (
        <div className="items-column-list scroll-if-needed scroll-smooth-touch">
            <ul className="unstyled m0">
                {contacts.map(({ ID, Name, LabelIDs = [], emails, isChecked }) => {
                    const initial = getInitial(Name);
                    return (
                        <li
                            key={ID}
                            className={`item-container flex bg-global-white flex-nowrap ${
                                selectedContactID === ID ? 'item-is-selected' : ''
                            }`}
                        >
                            <label className="item-icon flex-item-noshrink rounded50 bg-white inline-flex">
                                <span className="mauto item-abbr">{initial}</span>
                                <Checkbox
                                    checked={isChecked}
                                    className="item-checkbox sr-only"
                                    onChange={handleCheck}
                                    data-contact-id={ID}
                                />
                            </label>
                            <div
                                className="flex-item-fluid flex flex-column flex-spacebetween conversation-titlesender"
                                onClick={handleClick(ID)}
                            >
                                <div className="flex">
                                    <div className={`flex-item-fluid w0 ${LabelIDs.length ? 'pr1' : ''}`}>
                                        <span className="bold inbl mw100 ellipsis">{Name}</span>
                                    </div>
                                    {LabelIDs.length ? (
                                        <div>
                                            {LabelIDs.map((labelID) => {
                                                const { Color, Name } = mapContactGroups[labelID];
                                                return <ContactGroupIcon key={labelID} name={Name} color={Color} />;
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="mw100 ellipsis" title={emails.join(', ')}>
                                    {addPlus(emails)}
                                </div>
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
    onCheck: PropTypes.func,
    history: PropTypes.object.isRequired,
    selectedContactID: PropTypes.string
};

export default withRouter(ContactsList);
