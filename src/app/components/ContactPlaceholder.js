import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { redirectTo } from 'proton-shared/lib/helpers/browser';
import { PrimaryButton, Button, Icon, useModals, useContactGroups } from 'react-components';

import ContactGroupModal from './ContactGroupModal';
import ExportModal from './ExportModal';
import ImportModal from './import/ImportModal';

const PaidCards = ({ contactGroupID, user, userKeysList, loadingUserKeys }) => {
    const { createModal } = useModals();
    const handleExport = () => createModal(<ExportModal contactGroupID={contactGroupID} userKeysList={userKeysList} />);
    const handleGroups = () => redirectTo('/contacts/settings');

    const handleImport = () => {
        createModal(<ImportModal userKeysList={userKeysList} />);
    };

    return (
        <div className="flex flex-nowrap">
            <div className="bordered-container flex-item-fluid mr1 p1 aligncenter flex flex-column ">
                <div className="flex-item-fluid">
                    <Icon name="import" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Import contacts`}</div>
                    <p>{c('Info')
                        .t`Add contacts to your ProtonMail account by importing them from a CSV or vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <PrimaryButton className="bold" onClick={handleImport} disabled={loadingUserKeys}>{c('Action')
                        .t`Import`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid mr1 p1 aligncenter flex flex-column">
                <div className="flex-item-fluid">
                    <Icon name="export" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Export contacts`}</div>
                    <p>{c('Info')
                        .t`Create an backup of your ProtonMail contacts by exporting them to a vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <PrimaryButton onClick={handleExport} disabled={loadingUserKeys}>{c('Action')
                        .t`Export`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid p1 aligncenter">
                <div className="flex-item-fluid">
                    <Icon name="contacts" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Contacts settings`}</div>
                    <p>{c('Info')
                        .t`Use groups to send email to a list of addresses you regularly communicate with.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <PrimaryButton onClick={handleGroups}>{c('Action').t`Groups`}</PrimaryButton>
                </div>
            </div>
        </div>
    );
};

PaidCards.propTypes = {
    contactGroupID: PropTypes.string,
    user: PropTypes.object.isRequired,
    userKeysList: PropTypes.array,
    loadingUserKeys: PropTypes.bool
};

const FreeCards = () => {
    return (
        <div className="flex-autogrid">
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <div className="bold">{c('Title').t`Contact picture`}</div>
                    <p>{c('Info')
                        .t`With a premium ProtonMail plan, you can add a picture to your contacts to easily identify the sender of received emails.`}</p>
                    <Link className="pm-button pm-button--primary" to="/settings/subscription">{c('Action')
                        .t`Upgrade`}</Link>
                </div>
            </div>
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <div className="bold">{c('Title').t`Encrypted contact details`}</div>
                    <p>{c('Info')
                        .t`With a paid ProtonMail plan, you can fill your contacts details with phone numbers, addresses and more.`}</p>
                    <Link className="pm-button pm-button--primary" to="/settings/subscription">{c('Action')
                        .t`Upgrade`}</Link>
                </div>
            </div>
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <div className="bold">{c('Title').t`Manage groups`}</div>
                    <p>{c('Info')
                        .t`With a paid ProtonMail plan, you can use groups to send email to a list of addresses you regularly communicate with.`}</p>
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
    onUncheck
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
            </div>
            {hasPaidMail ? (
                <PaidCards user={user} userKeysList={userKeysList} loadingUserKeys={loadingUserKeys} />
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
    onUncheck: PropTypes.func
};

export default ContactPlaceholder;
