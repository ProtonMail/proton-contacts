import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, useContactGroups } from 'react-components';
import { withRouter } from 'react-router';
import { addPlus, getInitial } from 'proton-shared/lib/helpers/string';
import List from 'react-virtualized/dist/commonjs/List';

import ContactGroupIcon from './ContactGroupIcon';

const ContactsList = ({ contacts, onCheck, history, contactID }) => {
    const listRef = useRef(null);
    const containerRef = useRef(null);
    const [lastChecked, setLastChecked] = useState(); // Store ID of the last contact ID checked
    const getHeight = () => containerRef.current.clientHeight;
    const getWidth = () => containerRef.current.offsetWidth;
    const [contactGroups] = useContactGroups();
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const mapContactGroups = contactGroups.reduce((acc, contactGroup) => {
        acc[contactGroup.ID] = contactGroup;
        return acc;
    }, Object.create(null));

    const handleCheck = ({ target, shiftKey }) => {
        const contactID = target.getAttribute('data-contact-id');
        const contactIDs = [contactID];

        if (lastChecked && shiftKey) {
            const start = contacts.findIndex(({ ID }) => ID === contactID);
            const end = contactID.findIndex(({ ID }) => ID === lastChecked);
            const contactIDs = contacts.slice(Math.min(start, end), Math.max(start, end) + 1);
            contactIDs.push(...contacts.slice(Math.min(start, end), Math.max(start, end) + 1).map(({ ID }) => ID));
        }

        setLastChecked(contactID);
        onCheck(contactIDs, target.checked);
    };

    const handleClick = (ID) => () => history.push(`/contacts/${ID}`);

    const Row = ({
        index, // Index of row within collection
        style // Style object to be applied to row (to position it)
    }) => {
        const { ID, Name, LabelIDs = [], emails, isChecked } = contacts[index];
        const initial = getInitial(Name);
        return (
            <div
                style={style}
                key={ID}
                className={`item-container  bg-global-white  ${contactID === ID ? 'item-is-selected' : ''}`}
            >
                <div className="flex flex-nowrap">
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
                </div>
            </div>
        );
    };

    Row.propTypes = {
        key: PropTypes.string,
        index: PropTypes.number,
        style: PropTypes.string
    };

    const onResize = () => {
        setHeight(getHeight());
        setWidth(getWidth());
    };

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            onResize();

            if (contactID) {
                const index = contacts.findIndex(({ ID }) => contactID === ID);
                listRef.current.scrollToRow(index);
            }
        }, 200);

        document.addEventListener('resize', onResize);

        return () => {
            clearTimeout(timeoutID);
            document.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div ref={containerRef} className="items-column-list scroll-if-needed scroll-smooth-touch">
            <List
                ref={listRef}
                rowRenderer={Row}
                rowCount={contacts.length}
                rowHeight={76}
                height={height}
                width={width}
            />
        </div>
    );
};

ContactsList.propTypes = {
    contacts: PropTypes.array,
    onCheck: PropTypes.func,
    history: PropTypes.object.isRequired,
    contactID: PropTypes.string
};

export default withRouter(ContactsList);
