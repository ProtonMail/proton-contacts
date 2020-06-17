import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { useModals, PrimaryButton, Button, Icon, ContactGroupModal } from 'react-components';

import { redirectTo } from 'proton-shared/lib/helpers/browser';
import importSvg from 'design-system/assets/img/pm-images/contact-import.svg';
import exportSvg from 'design-system/assets/img/pm-images/contact-export.svg';
import contactGroupsSvg from 'design-system/assets/img/pm-images/contact-groups.svg';
import upgradeSvg from 'design-system/assets/img/pm-images/contact-unlock-features.svg';

import contactGroupCardLight from 'design-system/assets/img/shared/empty-address-book.svg';
import contactGroupCardDark from 'design-system/assets/img/shared/empty-address-book-dark.svg';

import ExportModal from './ExportModal';
import MergeRow from './MergeRow';
import { getLightOrDark } from 'proton-shared/lib/themes/helpers';

const PaidCards = ({ loadingUserKeys, onImport, onExport, onGroups }) => {
    return (
        <div className="flex flex-nowrap onmobile-flex-column boxes-placeholder-container">
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex-noMinChildren flex-column">
                <div className="flex-item-fluid">
                    <img src={importSvg} alt="contact-import" className="mb1" />
                    <div className="bold">{c('Title').t`Import contacts`}</div>
                    <p>{c('Info')
                        .t`Add contacts to your ProtonMail account by importing them from a CSV or vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="bold" onClick={onImport} disabled={loadingUserKeys}>{c('Action')
                        .t`Import`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex-noMinChildren flex-column">
                <div className="flex-item-fluid">
                    <img src={exportSvg} alt="contact-export" className="mb1" />
                    <div className="bold">{c('Title').t`Export contacts`}</div>
                    <p>{c('Info').t`Create a backup of your ProtonMail contacts by exporting them to a vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="bold" onClick={onExport} disabled={loadingUserKeys}>{c('Action')
                        .t`Export`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid onmobile-mr0 onmobile-mb1 p1 aligncenter flex-noMinChildren flex-column">
                <div className="flex-item-fluid">
                    <img src={contactGroupsSvg} alt="contact-groups" className="mb1" />
                    <div className="bold">{c('Title').t`Manage groups`}</div>
                    <p>{c('Info')
                        .t`Use groups to send email to a list of addresses you regularly communicate with.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="bold" onClick={onGroups}>{c('Action').t`Groups`}</PrimaryButton>
                </div>
            </div>
        </div>
    );
};

PaidCards.propTypes = {
    loadingUserKeys: PropTypes.bool,
    onImport: PropTypes.func,
    onExport: PropTypes.func,
    onGroups: PropTypes.func
};

const FreeCards = ({ loadingUserKeys, onImport, onExport }) => {
    const handleUpgrade = () => redirectTo('/settings/subscription');

    return (
        <div className="flex flex-nowrap onmobile-flex-column boxes-placeholder--2columns">
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex-noMinChildren flex-column">
                <div className="flex-item-fluid">
                    <img src={importSvg} alt="contact-import" className="mb1" />
                    <div className="bold">{c('Title').t`Import contacts`}</div>
                    <p>{c('Info')
                        .t`Add contacts to your ProtonMail account by importing them from a CSV or vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="bold" onClick={onImport} disabled={loadingUserKeys}>{c('Action')
                        .t`Import`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex-noMinChildren flex-column">
                <div className="flex-item-fluid">
                    <img src={exportSvg} alt="contact-export" className="mb1" />
                    <div className="bold">{c('Title').t`Export contacts`}</div>
                    <p>{c('Info').t`Create a backup of your ProtonMail contacts by exporting them to a vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="bold" onClick={onExport} disabled={loadingUserKeys}>{c('Action')
                        .t`Export`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid onmobile-mr0 onmobile-mb1 p1 aligncenter flex-noMinChildren flex-column">
                <div className="flex-item-fluid">
                    <img src={upgradeSvg} alt="contact-unlock-features" className="mb1" />
                    <div className="bold">{c('Title').t`Unlock features`}</div>
                    <p>{c('Info').t`Upgrade to a paid plan to manage contact groups.`}</p>
                </div>
                <div className="flex-item-noshrink mt2 boxes-placeholder-button">
                    <PrimaryButton className="bold" onClick={handleUpgrade}>
                        {c('Action').t`Upgrade`}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
};

FreeCards.propTypes = {
    loadingUserKeys: PropTypes.bool,
    onImport: PropTypes.func,
    onExport: PropTypes.func
};

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
    onGroups
}) => {
    const { hasPaidMail } = user;
    const { createModal } = useModals();

    const contactGroupCard = getLightOrDark(contactGroupCardLight, contactGroupCardDark);

    if (selectedContacts) {
        const totalContactsText = (
            <b key="total-contacts">
                {c('Info').ngettext(msgid`1 contact`, `${selectedContacts} contacts`, selectedContacts)}
            </b>
        );

        return (
            <div className="p2 view-column-detail flex flex-item-fluid scroll-if-needed">
                <div className="aligncenter center mbauto mtauto">
                    <div className="mb2">{c('Info').jt`You selected ${totalContactsText} from your address book.`}</div>
                    <div className="aligncenter mb2">
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

        const handleEdit = () => createModal(<ContactGroupModal contactGroupID={contactGroupID} />);
        const handleExport = () =>
            createModal(<ExportModal contactGroupID={contactGroupID} userKeysList={userKeysList} />);

        return (
            <div className="p2 view-column-detail flex flex-item-fluid scroll-if-needed">
                <div className="aligncenter center mbauto mtauto">
                    <h1 className="ellipsis lh-standard">{contactGroupName}</h1>
                    <div className="mb2">{c('Info').jt`You have ${totalContactsText} in this group.`}</div>
                    <div className="aligncenter mb2">
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
            <div className="aligncenter mt2">
                <h1>{c('Title').t`Contacts`}</h1>
                <div className="mb2">{c('Info').jt`You have ${boldTotalContacts} in your address book`}</div>
                <div className="mb1">
                    {c('Info')
                        .jt`You can decide whether or not contacts are automatically added to your address book by navigating to ${navigateTo}`}
                </div>
                <div className="mb1">
                    <Link to="/contacts/settings" className="inline-flex flex-nowrap nodecoration">
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
                    userKeysList={userKeysList}
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

ContactPlaceholder.propTypes = {
    totalContacts: PropTypes.number,
    totalContactsInGroup: PropTypes.number,
    selectedContacts: PropTypes.number,
    contactGroupID: PropTypes.string,
    contactGroupName: PropTypes.string,
    user: PropTypes.object.isRequired,
    userKeysList: PropTypes.array,
    loadingUserKeys: PropTypes.bool,
    onUncheck: PropTypes.func,
    canMerge: PropTypes.bool,
    onMerge: PropTypes.func,
    onImport: PropTypes.func,
    onExport: PropTypes.func,
    onGroups: PropTypes.func
};

export default ContactPlaceholder;
