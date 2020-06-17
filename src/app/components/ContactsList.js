import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import {
    useModals,
    IllustrationPlaceholder,
    LinkButton,
    classnames,
    ContactModal,
    ContactGroupModal
} from 'react-components';
import { withRouter } from 'react-router';
import { List, AutoSizer } from 'react-virtualized';

import noContactsImgLight from 'design-system/assets/img/shared/empty-address-book.svg';
import noContactsImgDark from 'design-system/assets/img/shared/empty-address-book-dark.svg';

import noResultsImgLight from 'design-system/assets/img/shared/no-result-search.svg';
import noResultsImgDark from 'design-system/assets/img/shared/no-result-search-dark.svg';

import ImportModal from './import/ImportModal';
import ContactRow from './ContactRow';
import { getLightOrDark } from 'proton-shared/lib/themes/helpers';
import { DENSITY } from 'proton-shared/lib/constants';

const ContactsList = ({
    totalContacts,
    totalContactsInGroup,
    contacts,
    contactGroupsMap,
    onCheck,
    onClearSearch,
    onClearSelection,
    user,
    userSettings,
    userKeysList,
    loadingUserKeys,
    history,
    contactID,
    contactGroupID,
    location,
    isDesktop = true
}) => {
    const listRef = useRef(null);
    const containerRef = useRef(null);
    const [lastChecked, setLastChecked] = useState(); // Store ID of the last contact ID checked
    const { createModal } = useModals();
    const isCompactView = userSettings.Density === DENSITY.COMPACT;

    const noContactsImg = getLightOrDark(noContactsImgLight, noContactsImgDark);

    const handleImport = () => {
        createModal(<ImportModal userKeysList={userKeysList} />);
    };
    const handleAddContact = () => {
        createModal(<ContactModal history={history} onAdd={onClearSearch} />);
    };
    const handleEditGroup = (contactGroupID) => {
        createModal(<ContactGroupModal contactGroupID={contactGroupID} />);
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

    const handleClick = (ID) => {
        onClearSelection();
        history.push({ ...location, pathname: `/contacts/${ID}` });
    };

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            if (contactID && totalContacts) {
                const index = contacts.findIndex(({ ID }) => contactID === ID);
                listRef.current.scrollToRow(index);
            }
        }, 200);

        return () => {
            clearTimeout(timeoutID);
        };
    }, [contactID]);

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
            <div className="p2 flex w100">
                <IllustrationPlaceholder
                    title={c('Info message').t`Your address book is empty`}
                    url={noContactsImg}
                    className="mtauto mbauto"
                >
                    <div className="flex flex-items-center">
                        {c('Actions message').jt`You can either ${addContact} or ${importContact} from a file.`}
                    </div>
                </IllustrationPlaceholder>
            </div>
        );
    }

    if (!contacts.length) {
        if (contactGroupID && !totalContactsInGroup) {
            const editGroup = (
                <button
                    key="add"
                    type="button"
                    className="color-primary ml0-5 mr0-5 underline"
                    onClick={() => handleEditGroup(contactGroupID)}
                >
                    {c('Action').t`Edit your group`}
                </button>
            );

            return (
                <div className="p2 aligncenter w100">
                    <IllustrationPlaceholder
                        title={c('Info message').t`Your contact group is empty`}
                        url={noContactsImg}
                    >
                        <div className="flex flex-items-center">
                            {c('Actions message').jt`You can ${editGroup} to add a contact.`}
                        </div>
                    </IllustrationPlaceholder>
                </div>
            );
        }

        const clearSearch = (
            <LinkButton key="add" onClick={onClearSearch} className="ml0-25 bold">
                {c('Action').t`Clear it`}
            </LinkButton>
        );

        const noResultsImg = getLightOrDark(noResultsImgLight, noResultsImgDark);

        return (
            <div className="p2 aligncenter w100">
                <IllustrationPlaceholder title={c('Info message').t`No results found`} url={noResultsImg}>
                    <div className="flex flex-items-center">
                        {c('Actions message').jt`You can either update your search query or ${clearSearch}.`}
                    </div>
                </IllustrationPlaceholder>
            </div>
        );
    }

    const contactRowHeightComfort = 64;
    const contactRowHeightCompact = 48;

    return (
        <div
            ref={containerRef}
            className={classnames([
                isDesktop ? 'items-column-list' : 'items-column-list--mobile',
                isCompactView && 'is-compact'
            ])}
        >
            <div className="items-column-list-inner items-column-list-inner--noborder">
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
                                    hasPaidMail={!!user.hasPaidMail}
                                    contactGroupsMap={contactGroupsMap}
                                    contact={contacts[index]}
                                    onClick={handleClick}
                                    onCheck={handleCheck}
                                    userSettings={userSettings}
                                />
                            )}
                            rowCount={contacts.length}
                            height={height}
                            width={width - 1}
                            rowHeight={isCompactView ? contactRowHeightCompact : contactRowHeightComfort}
                        />
                    )}
                </AutoSizer>
            </div>
        </div>
    );
};

ContactsList.propTypes = {
    totalContacts: PropTypes.number,
    contacts: PropTypes.array,
    contactGroupsMap: PropTypes.object,
    onCheck: PropTypes.func,
    onClearSearch: PropTypes.func,
    onClearSelection: PropTypes.func,
    user: PropTypes.object,
    userSettings: PropTypes.object,
    userKeysList: PropTypes.array,
    loadingUserKeys: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    contactID: PropTypes.string,
    contactGroupID: PropTypes.string,
    isDesktop: PropTypes.bool
};

export default withRouter(ContactsList);
