import React, { ReactNode } from 'react';
import { IllustrationPlaceholder, InlineLinkButton } from 'react-components';
import { c } from 'ttag';
import noContactsImg from 'design-system/assets/img/placeholders/empty-address-book.svg';
import noResultsImg from 'design-system/assets/img/placeholders/empty-search.svg';

export enum EmptyType {
    All,
    Group,
    Search,
}

interface Props {
    type: EmptyType | undefined;
    onEditGroup: () => void;
    onClearSearch: () => void;
    onImport: () => void;
    onCreate: () => void;
}

const EmptyPlaceholder = ({ type, onEditGroup, onClearSearch, onImport, onCreate }: Props) => {
    let imgUrl: string;
    let title: string;
    let actions: ReactNode;

    switch (type) {
        case EmptyType.Group: {
            title = c('Info message').t`Your contact group is empty`;
            imgUrl = noContactsImg;
            const editGroup = (
                <InlineLinkButton key="edit-group" onClick={onEditGroup}>{c('Action')
                    .t`Edit your group`}</InlineLinkButton>
            );
            actions = c('Actions message').jt`You can ${editGroup} to add a contact.`;
            break;
        }
        case EmptyType.Search: {
            title = c('Info message').t`No results found`;
            imgUrl = noResultsImg;
            const clearSearch = (
                <InlineLinkButton key="clear-search" onClick={onClearSearch}>{c('Action')
                    .t`Clear it`}</InlineLinkButton>
            );
            actions = c('Actions message').jt`You can either update your search query or ${clearSearch}.`;
            break;
        }
        case EmptyType.All:
        default: {
            title = c('Info message').t`Your address book is empty`;
            imgUrl = noContactsImg;
            const addContact = (
                <InlineLinkButton key="add-contact" onClick={onCreate}>{c('Action').t`Add a contact`}</InlineLinkButton>
            );
            const importContact = (
                <InlineLinkButton key="import" onClick={onImport}>
                    {c('Action').t`Import contacts`}
                </InlineLinkButton>
            );
            actions = c('Actions message').jt`You can either ${addContact} or ${importContact} from a file.`;
        }
    }

    return (
        <div className="p2 text-center w100">
            <IllustrationPlaceholder title={title} url={imgUrl}>
                <div>{actions}</div>
            </IllustrationPlaceholder>
        </div>
    );
};

export default EmptyPlaceholder;
