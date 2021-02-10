import React from 'react';
import { Link } from 'react-router-dom';
import { c, msgid } from 'ttag';
import { useModals, PrimaryButton, Button, Icon, ContactGroupModal, useAppLink } from 'react-components';
import { getLightOrDark } from 'proton-shared/lib/themes/helpers';
import { DecryptedKey, UserModel } from 'proton-shared/lib/interfaces';
import { getAccountSettingsApp } from 'proton-shared/lib/apps/helper';
import importSvg from 'design-system/assets/img/pm-images/contact-import.svg';
import exportSvg from 'design-system/assets/img/pm-images/contact-export.svg';
import contactGroupsSvg from 'design-system/assets/img/pm-images/contact-groups.svg';
import upgradeSvg from 'design-system/assets/img/pm-images/contact-unlock-features.svg';
import contactGroupCardLight from 'design-system/assets/img/shared/empty-address-book.svg';
import contactGroupCardDark from 'design-system/assets/img/shared/empty-address-book-dark.svg';
import ExportModal from './settings/ExportModal';
import MergeRow from './MergeRow';

interface PaidCardsProps {
    loadingUserKeys: boolean;
    onImport: () => void;
    onExport: () => void;
    onGroups: () => void;
}

const PaidCards = ({ loadingUserKeys, onImport, onExport, onGroups }: PaidCardsProps) => {
    return (
        <div className="flex flex-nowrap on-mobile-flex-column boxes-placeholder-container">
            <div className="bordered-container flex-item-fluid mr1 on-mobile-mr0 on-mobile-mb1 p1 text-center flex-no-min-children flex-column">
                <div className="flex-item-fluid">
                    <img src={importSvg} alt="contact-import" className="mb1" />
                    <div className="text-bold">{c('Title').t`Import contacts`}</div>
                    <p>{c('Info')
                        .t`Add contacts to your ProtonMail account by importing them from a CSV or vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="text-bold" onClick={onImport} disabled={loadingUserKeys}>{c('Action')
                        .t`Import`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid mr1 on-mobile-mr0 on-mobile-mb1 p1 text-center flex-no-min-children flex-column">
                <div className="flex-item-fluid">
                    <img src={exportSvg} alt="contact-export" className="mb1" />
                    <div className="text-bold">{c('Title').t`Export contacts`}</div>
                    <p>{c('Info').t`Create a backup of your ProtonMail contacts by exporting them to a vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="text-bold" onClick={onExport} disabled={loadingUserKeys}>{c('Action')
                        .t`Export`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid on-mobile-mr0 on-mobile-mb1 p1 text-center flex-no-min-children flex-column">
                <div className="flex-item-fluid">
                    <img src={contactGroupsSvg} alt="contact-groups" className="mb1" />
                    <div className="text-bold">{c('Title').t`Manage groups`}</div>
                    <p>{c('Info')
                        .t`Use groups to send email to a list of addresses you regularly communicate with.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="text-bold" onClick={onGroups}>{c('Action').t`Groups`}</PrimaryButton>
                </div>
            </div>
        </div>
    );
};

interface FreeCardsProps {
    loadingUserKeys: boolean;
    onImport: () => void;
    onExport: () => void;
}

const FreeCards = ({ loadingUserKeys, onImport, onExport }: FreeCardsProps) => {
    const goToApp = useAppLink();

    const handleUpgrade = () => {
        goToApp('/subscription', getAccountSettingsApp());
    };

    return (
        <div className="flex flex-nowrap on-mobile-flex-column boxes-placeholder-container">
            <div className="bordered-container flex-item-fluid mr1 on-mobile-mr0 on-mobile-mb1 p1 text-center flex-no-min-children flex-column">
                <div className="flex-item-fluid">
                    <img src={importSvg} alt="contact-import" className="mb1" />
                    <div className="text-bold">{c('Title').t`Import contacts`}</div>
                    <p>{c('Info')
                        .t`Add contacts to your ProtonMail account by importing them from a CSV or vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="text-bold" onClick={onImport} disabled={loadingUserKeys}>{c('Action')
                        .t`Import`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid mr1 on-mobile-mr0 on-mobile-mb1 p1 text-center flex-no-min-children flex-column">
                <div className="flex-item-fluid">
                    <img src={exportSvg} alt="contact-export" className="mb1" />
                    <div className="text-bold">{c('Title').t`Export contacts`}</div>
                    <p>{c('Info').t`Create a backup of your ProtonMail contacts by exporting them to a vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="text-bold" onClick={onExport} disabled={loadingUserKeys}>{c('Action')
                        .t`Export`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid on-mobile-mr0 on-mobile-mb1 p1 text-center flex-no-min-children flex-column">
                <div className="flex-item-fluid">
                    <img src={upgradeSvg} alt="contact-unlock-features" className="mb1" />
                    <div className="text-bold">{c('Title').t`Unlock features`}</div>
                    <p>{c('Info').t`Upgrade to a paid plan to manage contact groups.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="text-bold" onClick={handleUpgrade}>
                        {c('Action').t`Upgrade`}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
};

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
    onMerge: () => void;
    onImport: () => void;
    onExport: () => void;
    onGroups: () => void;
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
    canMerge,
    onMerge,
    onImport,
    onExport,
    onGroups,
}: Props) => {
    const { hasPaidMail } = user;
    const { createModal } = useModals();

    const contactGroupCard = getLightOrDark(contactGroupCardLight, contactGroupCardDark);

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
                        {/* <Button disabled={loadingUserKeys}>{c('Action').t`Export`}</Button> */}
                    </div>
                </div>
            </div>
        );
    }

    if (contactGroupID) {
        const totalContactsText = (
            <b key="total-contacts">
                {totalContactsInGroup === 1 ? c('Info').t`1 contact` : c('Info').t`${totalContactsInGroup} contacts`}
            </b>
        );

        const handleEdit = () =>
            createModal(<ContactGroupModal contactGroupID={contactGroupID} selectedContactEmails={[]} />);
        const handleExport = () =>
            createModal(<ExportModal contactGroupID={contactGroupID} userKeysList={userKeysList} />);

        return (
            <div className="p2 view-column-detail flex flex-item-fluid scroll-if-needed">
                <div className="text-center center mbauto mtauto">
                    <h1 className="text-ellipsis lh-rg">{contactGroupName}</h1>
                    <div className="mb2">{c('Info').jt`You have ${totalContactsText} in this group.`}</div>
                    <div className="text-center mb2">
                        <img src={contactGroupCard} alt="contact-group-card" />
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
    const navigateTo = <b key="boldface-2">{c('Info').t`Settings > General > Contacts`}</b>;

    return (
        <div className="p2 view-column-detail flex-item-fluid scroll-if-needed">
            <div className="text-center mt2">
                <h1>{c('Title').t`Contacts`}</h1>
                <div className="mb2">{c('Info').jt`You have ${boldTotalContacts} in your address book`}</div>
                <div className="mb1">
                    {c('Info')
                        .jt`You can decide whether or not contacts are automatically added to your address book by navigating to ${navigateTo}`}
                </div>
                <div className="mb1">
                    <Link to="/settings" className="inline-flex flex-nowrap text-no-decoration">
                        <Icon className="mr0-5 flex-item-centered-vert" name="settings-master" />
                        <span>{c('Title').t`Settings`}</span>
                    </Link>
                </div>

                {canMerge && (
                    <div className="mb2">
                        <MergeRow loadingUserKeys={loadingUserKeys} onMerge={onMerge} />
                    </div>
                )}
            </div>
            {hasPaidMail ? (
                <PaidCards
                    loadingUserKeys={loadingUserKeys}
                    onImport={onImport}
                    onExport={() => onExport()}
                    onGroups={onGroups}
                />
            ) : (
                <FreeCards loadingUserKeys={loadingUserKeys} onImport={onImport} onExport={() => onExport()} />
            )}
        </div>
    );
};

export default ContactPlaceholder;
