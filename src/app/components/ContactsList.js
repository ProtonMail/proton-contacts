import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useContactGroups } from 'react-components';
import { withRouter } from 'react-router';
import { addPlus, getInitial } from 'proton-shared/lib/helpers/string';
import List from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

import ContactGroupIcon from './ContactGroupIcon';
import ItemCheckbox from './ItemCheckbox';
import ContactGroupIcon from './ContactGroupIcon';
import { extractMergeable } from '../helpers/merge';
import { c } from 'ttag';
import MergeRow from './MergeRow';

const ContactsList = ({ contacts, onCheck, hasPaidMail, userKeysList, history, contactID, location }) => {
    const mergeableContacts = extractMergeable(contacts);
    const canMerge = mergeableContacts.length > 0;
    const listRef = useRef(null);
    const containerRef = useRef(null);
    const [lastChecked, setLastChecked] = useState(); // Store ID of the last contact ID checked
    const [contactGroups] = useContactGroups();
    const mapContactGroups = contactGroups.reduce((acc, contactGroup) => {
        acc[contactGroup.ID] = contactGroup;
        return acc;
    }, Object.create(null));

    const handleCheck = (event) => {
        const { target } = event;
        const shiftKey = event.nativeEvent.shiftKey;

        const contactID = target.getAttribute('data-contact-id');
        const contactIDs = [contactID];

        if (lastChecked && shiftKey) {
            const start = contacts.findIndex(({ ID }) => ID === contactID);
            const end = contacts.findIndex(({ ID }) => ID === lastChecked);
            contactIDs.push(...contacts.slice(Math.min(start, end), Math.max(start, end) + 1).map(({ ID }) => ID));
        }

        setLastChecked(contactID);
        onCheck(contactIDs, target.checked);
    };

    const handleClick = (ID) => () => history.push({ ...location, pathname: `/contacts/${ID}` });

    const stop = (e) => e.stopPropagation();

    const Row = ({
        index, // Index of row within collection
        style, // Style object to be applied to row (to position it)
        key
    }) => {
        if (canMerge && !index) {
            return (
                <MergeRow
                    key={key}
                    style={style}
                    mergeableContacts={mergeableContacts}
                    hasPaidMail={hasPaidMail}
                    userKeysList={userKeysList}
                />
            );
        }

        const { ID, Name, LabelIDs = [], Emails, isChecked } = contacts[index];
        const initial = getInitial(Name);
        return (
            <div
                style={style}
                key={ID}
                onClick={handleClick(ID)}
                className={`item-container bg-global-white  ${contactID === ID ? 'item-is-selected' : ''}`}
            >
                <div className="flex flex-nowrap">
                    <span onClick={stop}>
                        <ItemCheckbox
                            checked={isChecked}
                            className="item-checkbox sr-only"
                            onChange={handleCheck}
                            data-contact-id={ID}
                        >
                            {initial}
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
                                        const { Color, Name } = mapContactGroups[labelID];
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
                        <div className="mw100 ellipsis" title={Emails.join(', ')}>
                            {addPlus(Emails)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    Row.propTypes = {
        key: PropTypes.string,
        index: PropTypes.number,
        style: PropTypes.string
    };

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            if (contactID) {
                const index = contacts.findIndex(({ ID }) => contactID === ID);
                listRef.current.scrollToRow(index);
            }
        }, 200);

        return () => {
            clearTimeout(timeoutID);
        };
    }, []);

    if (!contacts.length) {
        return (
            <div className="items-column-list p1 aligncenter">
                {c('Info').t`You have 0 contacts in your address book`}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="items-column-list">
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        className="contacts-list"
                        ref={listRef}
                        rowRenderer={Row}
                        rowCount={contacts.length + canMerge}
                        height={height}
                        width={width}
                        rowHeight={76}
                    />
                )}
            </AutoSizer>
        </div>
    );
};

ContactsList.propTypes = {
    contacts: PropTypes.array,
    onCheck: PropTypes.func,
    hasPaidMail: PropTypes.number,
    userKeysList: PropTypes.array,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    contactID: PropTypes.string
};

export default withRouter(ContactsList);
