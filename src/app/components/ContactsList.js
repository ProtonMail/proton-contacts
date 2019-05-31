import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Icon, useContactGroups } from 'react-components';
import { withRouter } from 'react-router';
import { addPlus } from 'proton-shared/lib/helpers/string';

const ContactsList = ({ contacts, onCheck, history }) => {
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
        <div>
            <ul className="unstyled">
                {contacts.map(({ ID, Name, LabelIDs = [], emails, isChecked }) => {
                    return (
                        <li key={ID} className="p1 border-bottom flex bg-global-white" onClick={handleClick(ID)}>
                            <div>
                                <Checkbox checked={isChecked} onChange={handleCheck} data-contact-id={ID} />
                            </div>
                            <div>
                                <div className="flex flex-spacebetween">
                                    <span className="bold">{Name}</span>
                                    {LabelIDs.length ? (
                                        <div>
                                            {LabelIDs.map((labelID) => {
                                                const { Color, Name } = mapContactGroups[labelID];
                                                return (
                                                    <Icon
                                                        key={labelID}
                                                        name="contacts-groups"
                                                        color={Color}
                                                        title={Name}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                                <div title={emails.join(', ')}>{addPlus(emails)}</div>
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
    history: PropTypes.object.isRequired
};

export default withRouter(ContactsList);
