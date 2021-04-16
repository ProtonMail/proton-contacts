import React from 'react';
import { c, msgid } from 'ttag';
import {
    useModals,
    PrimaryButton,
    Button,
    ContactGroupModal,
    ContactsExportModal,
    SettingsLink,
} from 'react-components';
import { DecryptedKey, UserModel } from 'proton-shared/lib/interfaces';
import { capitalize } from 'proton-shared/lib/helpers/string';
import importContacts from 'design-system/assets/img/placeholders/import-contacts.svg';
import contactGroupCard from 'design-system/assets/img/placeholders/empty-address-book.svg';

interface Props {
    totalContacts: number;
    totalContactsInGroup: number | undefined;
    selectedContacts: number;
    contactGroupID: string | undefined;
    contactGroupName: string | undefined;
    user: UserModel;
    userKeysList: DecryptedKey[];
    loadingUserKeys: boolean;
    onUncheck: () => void;
    canMerge: boolean;
    canImport: boolean;
    onMerge: () => void;
    onImport: () => void;
}

const ContactPlaceholder = ({
    totalContacts = 0,
    selectedContacts = 0,
    totalContactsInGroup = 0,
    contactGroupID,
    contactGroupName,
    user,
    userKeysList,
    loadingUserKeys,
    onUncheck,
    canImport,
    canMerge,
    onMerge,
    onImport,
}: Props) => {
    const { createModal } = useModals();

    if (selectedContacts) {
        const totalContactsText = (
            <b key="total-contacts">
                {c('Info').ngettext(
                    msgid`${selectedContacts} contact`,
                    `${selectedContacts} contacts`,
                    selectedContacts
                )}
            </b>
        );

        return (
            <div className="p2 view-column-detail flex flex-item-fluid scroll-if-needed">
                <div className="text-center center mbauto mtauto">
                    <div className="mb2">{c('Info').jt`You selected ${totalContactsText} from your address book.`}</div>
                    <div className="text-center mb2">
                        <img src={contactGroupCard} alt="contact-group-card" />
                    </div>
                    <div className="mb2">
                        <Button className="mr1" onClick={onUncheck}>
                            {c('Action').ngettext(msgid`Deselect`, `Deselect all`, selectedContacts)}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (contactGroupID) {
        const totalContactsText = (
            <b key="total-contacts">
                {c('Info').ngettext(
                    msgid`${totalContactsInGroup} contact`,
                    `${totalContactsInGroup} contacts`,
                    totalContactsInGroup
                )}
            </b>
        );

        const handleEdit = () =>
            createModal(<ContactGroupModal contactGroupID={contactGroupID} selectedContactEmails={[]} />);
        const handleExport = () =>
            createModal(<ContactsExportModal contactGroupID={contactGroupID} userKeysList={userKeysList} />);

        return (
            <div className="p2 view-column-detail flex flex-item-fluid scroll-if-needed">
                <div className="text-center center mbauto mtauto">
                    <h1 className="text-ellipsis lh-rg">{contactGroupName}</h1>
                    <div className="mb2">{c('Info').jt`You have ${totalContactsText} in this group.`}</div>
                    <div className="text-center mb2">
                        <img src={contactGroupCard} alt="" />
                    </div>
                    <div className="mb2">
                        <Button className="mr1" onClick={handleEdit}>{c('Action').t`Edit`}</Button>
                        {!!totalContactsInGroup && (
                            <Button onClick={handleExport} disabled={loadingUserKeys}>
                                {c('Action').t`Export`}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const boldTotalContacts =
        totalContacts === 1 ? (
            <b key="boldface">{c('Info').t`one contact`}</b>
        ) : (
            <b key="boldface">{c('Info').t`${totalContacts} contacts`}</b>
        );

    const userName = (
        <span key="display-name" className="inline-block max-w100 text-ellipsis align-bottom">
            {capitalize(user.DisplayName)}
        </span>
    );

    return (
        <div className="view-column-detail flex flex-column flex-nowrap flex-item-fluid">
            {user.hasPaidMail ? null : (
                <div className="bg-primary flex-item-noshrink color-white p1 text-center">
                    <span className="mr1">{c('Info').jt`Increase storage space starting at $4/month.`}</span>
                    <SettingsLink path="/dashboard" className="text-bold link align-baseline color-inherit">
                        {c('Action').t`Upgrade`}
                    </SettingsLink>
                </div>
            )}
            <div className="flex flex-item-fluid scroll-if-needed pt1 pb1 pr2 pl2">
                <div className="mauto text-center max-w30e">
                    <h1>{user.DisplayName ? c('Title').jt`Welcome ${userName}` : c('Title').t`Welcome`}</h1>
                    <p>{c('Info').jt`You have ${boldTotalContacts} in your address book`}</p>
                    <hr className="mb2 mt2" />
                    <div className="text-rg">
                        <img
                            className="hauto"
                            src={importContacts}
                            alt={c('Alternative text for welcome image').t`Welcome`}
                        />
                    </div>
                    {canImport ? (
                        <div className="text-rg">
                            <Button onClick={onImport}>{c('Action').t`Import contacts`}</Button>
                        </div>
                    ) : null}
                    <hr className="mb2 mt2" />
                    {canMerge ? (
                        <>
                            <p>
                                {c('Info').t`Two or more contacts appear to be identical.`}
                                <br />
                                {c('Info').t`Would you like to merge these contacts now?`}
                            </p>
                            <div className="text-rg">
                                <PrimaryButton disabled={loadingUserKeys} onClick={onMerge}>{c('Action')
                                    .t`Merge contacts`}</PrimaryButton>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ContactPlaceholder;
