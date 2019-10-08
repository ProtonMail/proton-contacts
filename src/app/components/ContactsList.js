import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { useModals, IllustrationPlaceholder } from 'react-components';
import { withRouter } from 'react-router';
import List from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

import noContactsImg from 'design-system/assets/img/shared/empty-address-book.svg';
import noResultsImg from 'design-system/assets/img/shared/no-results-found.svg';

import ImportModal from './import/ImportModal';
import ContactModal from './ContactModal';
import ContactRow from './ContactRow';

const ContactsList = ({
    totalContacts,
    contacts,
    contactGroupsMap,
    onCheck,
    onClear,
    user,
    userKeysList,
    loadingUserKeys,
    history,
    contactID,
    location
}) => {
    const listRef = useRef(null);
    const containerRef = useRef(null);
    const [lastChecked, setLastChecked] = useState(); // Store ID of the last contact ID checked
    const { createModal } = useModals();

    const handleImport = () => {
        createModal(<ImportModal userKeysList={userKeysList} />);
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

    const handleClick = (ID) => history.push({ ...location, pathname: `/contacts/${ID}` });

    const handleStop = (e) => e.stopPropagation();

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

    if (!totalContacts) {
        const addContact = (
            <button key="add" type="button" className="color-primary ml0-5 mr0-5 underline" onClick={handleAddContact}>
                {c('Action').t`Add a contact`}
            </button>
        );
        const importContact = (
            <button
                key="import"
                type="button"
                className="color-primary ml0-5 mr0-5 underline"
                onClick={handleImport}
                disabled={loadingUserKeys}
            >
                {c('Action').t`Import contact`}
            </button>
        );

        return (
            <div className="p2 aligncenter w100">
                <IllustrationPlaceholder title={c('Info message').t`Your address book is empty`} url={noContactsImg}>
                    <div className="flex flex-items-center">
                        {c('Actions message').jt`You can either ${addContact} or ${importContact} from a file`}
                    </div>
                </IllustrationPlaceholder>
            </div>
        );
    }

    if (!contacts.length) {
        const clearSearch = (
            <button key="add" type="button" className="color-primary underline ml0-5 mr0-5" onClick={onClear}>
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
                        className="contacts-list no-outline"
                        ref={listRef}
                        rowRenderer={({ index, style, key }) => (
                            <ContactRow
                                style={style}
                                key={key}
                                contactID={contactID}
                                hasPaidMail={user.hasPaidMail}
                                contactGroupsMap={contactGroupsMap}
                                contact={contacts[index]}
                                onClick={handleClick}
                                onCheck={handleCheck}
                                onStop={handleStop}
                            />
                        )}
                        rowCount={contacts.length}
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
    totalContacts: PropTypes.number,
    contacts: PropTypes.array,
    contactGroupsMap: PropTypes.object,
    onCheck: PropTypes.func,
    onClear: PropTypes.func,
    user: PropTypes.object,
    userKeysList: PropTypes.array,
    loadingUserKeys: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    contactID: PropTypes.string
};

export default withRouter(ContactsList);
