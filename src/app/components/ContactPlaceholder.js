import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { PrimaryButton, Button, Icon, useModals, useContactGroups } from 'react-components';

import ContactGroupModal from './ContactGroupModal';
import MergeRow from './MergeRow';

const PaidCards = ({ loadingUserKeys, onImport, onExport, onGroups }) => {
    return (
        <div className="flex flex-nowrap">
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex flex-column">
                <div className="flex-item-fluid">
                    <Icon name="import" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Import contacts`}</div>
                    <p>{c('Info')
                        .t`Add contacts to your ProtonMail account by importing them from a CSV or vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <PrimaryButton className="bold" onClick={onImport} disabled={loadingUserKeys}>{c('Action')
                        .t`Import`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex flex-column">
                <div className="flex-item-fluid">
                    <Icon name="export" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Export contacts`}</div>
                    <p>{c('Info')
                        .t`Create an backup of your ProtonMail contacts by exporting them to a vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <PrimaryButton onClick={onExport} disabled={loadingUserKeys}>{c('Action').t`Export`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid onmobile-mr0 onmobile-mb1 p1 aligncenter">
                <div className="flex-item-fluid">
                    <Icon name="contacts" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Contacts settings`}</div>
                    <p>{c('Info')
                        .t`Use groups to send email to a list of addresses you regularly communicate with.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <PrimaryButton onClick={onGroups}>{c('Action').t`Groups`}</PrimaryButton>
                </div>
            </div>
        </div>
    );
};

PaidCards.propTypes = {
    contactGroupID: PropTypes.string,
    userKeysList: PropTypes.array,
    loadingUserKeys: PropTypes.bool,
    onImport: PropTypes.func,
    onExport: PropTypes.func,
    onGroups: PropTypes.func
};

const FreeCards = () => {
    return (
        <div className="flex flex-nowrap onmobile-flex-column">
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex flex-column">
                <div className="flex-item-fluid-auto">
                    <div className="bold">{c('Title').t`Contact picture`}</div>
                    <p>{c('Info')
                        .t`With a premium ProtonMail plan, you can add a picture to your contacts to easily identify the sender of received emails.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <Link className="pm-button pm-button--primary" to="/settings/subscription">{c('Action')
                        .t`Upgrade`}</Link>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex flex-column">
                <div className="flex-item-fluid-auto">
                    <div className="bold">{c('Title').t`Encrypted contact details`}</div>
                    <p>{c('Info')
                        .t`With a paid ProtonMail plan, you can fill your contacts details with phone numbers, addresses and more.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <Link className="pm-button pm-button--primary" to="/settings/subscription">{c('Action')
                        .t`Upgrade`}</Link>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid onmobile-mr0 onmobile-mb1 p1 aligncenter flex flex-column">
                <div className="flex-item-fluid-auto">
                    <div className="bold">{c('Title').t`Manage groups`}</div>
                    <p>{c('Info')
                        .t`With a paid ProtonMail plan, you can use groups to send email to a list of addresses you regularly communicate with.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <Link className="pm-button pm-button--primary" to="/settings/subscription">{c('Action')
                        .t`Upgrade`}</Link>
                </div>
            </div>
        </div>
    );
};

const ContactPlaceholder = ({
    totalContacts = 0,
    contacts = [],
    contactGroupID,
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
    const selectedContacts = contacts.filter(({ isChecked }) => isChecked);
    const countSelectedContacts = selectedContacts.length;
    const [contactGroups] = useContactGroups();
    const { createModal } = useModals();

    if (countSelectedContacts) {
        return (
            <div className="p2 view-column-detail flex-item-fluid aligncenter">
                <h1>
                    {c('Info').ngettext(
                        msgid`${countSelectedContacts} contact selected`,
                        `${countSelectedContacts} contacts selected`,
                        countSelectedContacts
                    )}
                </h1>
                <Button onClick={onUncheck}>{c('Action').t`Deselect all`}</Button>
            </div>
        );
    }

    if (contactGroupID) {
        const { Name } = contactGroups.find(({ ID }) => ID === contactGroupID);
        const handleClick = () => createModal(<ContactGroupModal contactGroupID={contactGroupID} />);
        return (
            <div className="p2 view-column-detail flex-item-fluid scroll-if-needed">
                <div className="aligncenter">
                    <h1 className="ellipsis lh-standard">{Name}</h1>
                    <div className="mb1">
                        {c('Info').ngettext(
                            msgid`You have ${totalContacts} contact in your address book`,
                            `You have ${totalContacts} contacts in your address book`,
                            totalContacts
                        )}
                    </div>
                    <div className="mb2">
                        <PrimaryButton onClick={handleClick}>{c('Action').t`Edit group`}</PrimaryButton>
                    </div>
                    {hasPaidMail ? (
                        <PaidCards
                            user={user}
                            userKeysList={userKeysList}
                            loadingUserKeys={loadingUserKeys}
                            contactGroupID={contactGroupID}
                            onImport={onImport}
                            onExport={() => onExport(contactGroupID)}
                            onGroups={onGroups}
                        />
                    ) : (
                        <FreeCards />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p2 view-column-detail flex-item-fluid scroll-if-needed">
            <div className="aligncenter">
                <h1>{c('Title').t`Contacts`}</h1>
                <div className="mb2">
                    {c('Info').ngettext(
                        msgid`You have ${totalContacts} contact in your address book`,
                        `You have ${totalContacts} contacts in your address book`,
                        totalContacts
                    )}
                </div>
                {canMerge && (
                    <div className="mb2">
                        <MergeRow loadingUserKeys={loadingUserKeys} onMerge={onMerge} />
                    </div>
                )}
            </div>
            {hasPaidMail ? (
                <PaidCards
                    user={user}
                    userKeysList={userKeysList}
                    loadingUserKeys={loadingUserKeys}
                    onImport={onImport}
                    onExport={() => onExport()}
                    onGroups={onGroups}
                />
            ) : (
                <FreeCards />
            )}
        </div>
    );
};

ContactPlaceholder.propTypes = {
    totalContacts: PropTypes.number,
    contacts: PropTypes.array,
    contactGroupID: PropTypes.string,
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
