import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useModals, useContactGroups, IllustrationPlaceholder } from 'react-components';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import List from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

import { addPlus, getInitial } from 'proton-shared/lib/helpers/string';
import noContactsImg from 'design-system/assets/img/shared/empty-address-book.svg';
import noResultsImg from 'design-system/assets/img/shared/no-results-found.svg';
import { extractMergeable } from '../helpers/merge';

import ItemCheckbox from './ItemCheckbox';
import ContactGroupIcon from './ContactGroupIcon';
import MergeRow from './MergeRow';
import ImportModal from './import/ImportModal';
import ContactModal from './ContactModal';

const ContactsList = ({
    emptyAddressBook,
    contacts,
    onCheck,
    onMerge,
    onClear,
    user,
    history,
    contactID,
    location
}) => {
    const mergeableContacts = useMemo(() => extractMergeable(contacts), [contacts]);
    const canMerge = mergeableContacts.length > 0;
    const listRef = useRef(null);
    const containerRef = useRef(null);
    const [lastChecked, setLastChecked] = useState(); // Store ID of the last contact ID checked
    const { createModal } = useModals();
    const [contactGroups] = useContactGroups();
    const mapContactGroups = contactGroups.reduce((acc, contactGroup) => {
        acc[contactGroup.ID] = contactGroup;
        return acc;
    }, Object.create(null));

    const handleImport = () => {
        createModal(<ImportModal />);
    };
    const handleAddContact = () => {
        createModal(<ContactModal />);
    };

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

    const handleMerge = () => onMerge(mergeableContacts);

    const handleClick = (ID) => () => history.push({ ...location, pathname: `/contacts/${ID}` });

    const stop = (e) => e.stopPropagation();

    const Row = ({
        index, // Index of row within collection
        style, // Style object to be applied to row (to position it)
        key
    }) => {
        if (canMerge && !index) {
            return <MergeRow key={key} style={style} onMerge={handleMerge} />;
        }
        const contactIndex = canMerge ? index - 1 : index;

        const { ID, Name, LabelIDs = [], emails, isChecked } = contacts[contactIndex];
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
                            {user.hasPaidMail && LabelIDs.length ? (
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

    if (emptyAddressBook) {
        const addContact = (
            <button key="add" type="button" className="color-pm-blue underline ml0-5 mr0-5" onClick={handleAddContact}>
                {c('Action').t`Add a contact`}
            </button>
        );
        const upgrade = (
            <Link key="upgrade" className="color-pm-blue underline ml0-5 mr0-5" to="/settings/subscription">
                {c('Action').t`Upgrade`}
            </Link>
        );
        const importContact = (
            <button key="import" type="button" className="color-pm-blue underline ml0-5 mr0-5" onClick={handleImport}>
                {c('Action').t`Import contact`}
            </button>
        );
        const message = user.hasPaidMail
            ? c('Actions message').jt`You can either ${addContact} or ${importContact} from a file`
            : c('Actions message').jt`You can ${addContact} or ${upgrade} to import contacts from a file`;

        return (
            <div className="p2 aligncenter w50">
                <IllustrationPlaceholder title={c('Info message').t`Your address book is empty`} url={noContactsImg}>
                    <div className="flex flex-items-center">{message}</div>
                </IllustrationPlaceholder>
            </div>
        );
    }

    if (!contacts.length) {
        const clearSearch = (
            <button key="add" type="button" className="color-pm-blue underline ml0-5 mr0-5" onClick={onClear}>
                {c('Action').t`Clear it`}
            </button>
        );

        return (
            <div className="p2 aligncenter w50">
                <IllustrationPlaceholder title={c('Info message').t`No results found`} url={noResultsImg}>
                    <div className="flex flex-items-center">
                        {c('Actions message').jt`You can either update your query search or ${clearSearch}`}
                    </div>
                </IllustrationPlaceholder>
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
    emptyAddressBook: PropTypes.bool,
    contacts: PropTypes.array,
    onCheck: PropTypes.func,
    onMerge: PropTypes.func,
    onClear: PropTypes.func,
    user: PropTypes.object,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    contactID: PropTypes.string
};

export default withRouter(ContactsList);
