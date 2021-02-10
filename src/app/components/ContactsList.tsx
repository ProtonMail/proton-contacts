import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { c } from 'ttag';
import {
    useModals,
    IllustrationPlaceholder,
    LinkButton,
    classnames,
    ContactModal,
    ContactGroupModal,
} from 'react-components';
import { useHistory, useLocation } from 'react-router';
import { getLightOrDark } from 'proton-shared/lib/themes/helpers';
import { DENSITY } from 'proton-shared/lib/constants';
import { List, AutoSizer } from 'react-virtualized';
import { ContactGroup } from 'proton-shared/lib/interfaces/contacts';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import { UserModel, UserSettings } from 'proton-shared/lib/interfaces';
import noContactsImgLight from 'design-system/assets/img/shared/empty-address-book.svg';
import noContactsImgDark from 'design-system/assets/img/shared/empty-address-book-dark.svg';
import noResultsImgLight from 'design-system/assets/img/shared/no-result-search.svg';
import noResultsImgDark from 'design-system/assets/img/shared/no-result-search-dark.svg';
import ContactRow from './ContactRow';
import { FormattedContact } from '../interfaces/FormattedContact';

interface Props {
    totalContacts: number;
    totalContactsInGroup: number | undefined;
    contacts: FormattedContact[];
    contactGroupsMap: SimpleMap<ContactGroup>;
    onCheck: (contactIDs?: string[], checked?: boolean) => void;
    onClearSearch: () => void;
    onClearSelection: () => void;
    onImport: () => void;
    user: UserModel;
    userSettings: UserSettings;
    loadingUserKeys: boolean;
    contactID: string;
    contactGroupID: string | undefined;
    isDesktop: boolean;
}

const ContactsList = ({
    totalContacts,
    totalContactsInGroup,
    contacts,
    contactGroupsMap,
    onCheck,
    onClearSearch,
    onClearSelection,
    onImport,
    user,
    userSettings,
    loadingUserKeys,
    contactID,
    contactGroupID,
    isDesktop = true,
}: Props) => {
    const history = useHistory();
    const location = useLocation();
    const listRef = useRef<List>(null);
    const containerRef = useRef(null);
    const [lastChecked, setLastChecked] = useState<string>(); // Store ID of the last contact ID checked
    const { createModal } = useModals();
    const isCompactView = userSettings.Density === DENSITY.COMPACT;

    const noContactsImg = getLightOrDark(noContactsImgLight, noContactsImgDark);

    const handleAddContact = () => {
        createModal(<ContactModal history={history} onAdd={onClearSearch} />);
    };
    const handleEditGroup = (contactGroupID: string) => {
        createModal(<ContactGroupModal contactGroupID={contactGroupID} selectedContactEmails={[]} />);
    };

    const handleCheck = (event: ChangeEvent) => {
        const target = event.target as HTMLInputElement;
        const { shiftKey } = event.nativeEvent as any;

        const contactID = target.getAttribute('data-contact-id') as string;
        const contactIDs = [contactID];

        if (lastChecked && shiftKey) {
            const start = contacts.findIndex(({ ID }) => ID === contactID);
            const end = contacts.findIndex(({ ID }) => ID === lastChecked);
            contactIDs.push(...contacts.slice(Math.min(start, end), Math.max(start, end) + 1).map(({ ID }) => ID));
        }

        setLastChecked(contactID);
        onCheck(contactIDs, target.checked);
    };

    const handleClick = (ID: string) => {
        onClearSelection();
        history.push({ ...location, pathname: `/${ID}` });
    };

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            if (contactID && totalContacts) {
                const index = contacts.findIndex(({ ID }) => contactID === ID);
                listRef.current?.scrollToRow(index);
            }
        }, 200);

        return () => {
            clearTimeout(timeoutID);
        };
    }, [contactID]);

    if (!totalContacts) {
        const addContact = (
            <button
                key="add"
                type="button"
                className="color-primary ml0-5 mr0-5 text-underline"
                onClick={handleAddContact}
            >
                {c('Action').t`Add a contact`}
            </button>
        );
        const importContact = (
            <button
                key="import"
                type="button"
                className="color-primary ml0-5 mr0-5 text-underline"
                onClick={onImport}
                disabled={loadingUserKeys}
            >
                {c('Action').t`Import contacts`}
            </button>
        );

        return (
            <div className="p2 flex w100">
                <IllustrationPlaceholder
                    title={c('Info message').t`Your address book is empty`}
                    url={noContactsImg}
                    className="mtauto mbauto"
                >
                    <div className="flex flex-align-items-center">
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
                    className="color-primary ml0-5 mr0-5 text-underline"
                    onClick={() => handleEditGroup(contactGroupID)}
                >
                    {c('Action').t`Edit your group`}
                </button>
            );

            return (
                <div className="p2 text-center w100">
                    <IllustrationPlaceholder
                        title={c('Info message').t`Your contact group is empty`}
                        url={noContactsImg}
                    >
                        <div className="flex flex-align-items-center">
                            {c('Actions message').jt`You can ${editGroup} to add a contact.`}
                        </div>
                    </IllustrationPlaceholder>
                </div>
            );
        }

        const clearSearch = (
            <LinkButton key="add" onClick={onClearSearch} className="ml0-25 text-bold">
                {c('Action').t`Clear it`}
            </LinkButton>
        );

        const noResultsImg = getLightOrDark(noResultsImgLight, noResultsImgDark);

        return (
            <div className="p2 text-center w100">
                <IllustrationPlaceholder title={c('Info message').t`No results found`} url={noResultsImg}>
                    <div className="flex flex-align-items-center">
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
                isCompactView && 'is-compact',
            ])}
        >
            <div className="items-column-list-inner items-column-list-inner--no-border">
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

export default ContactsList;
