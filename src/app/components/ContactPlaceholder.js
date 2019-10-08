import React from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { PrimaryButton, Button, Icon, useModals, useContactGroups } from 'react-components';
import { withRouter } from 'react-router-dom';

import { redirectTo } from 'proton-shared/lib/helpers/browser';
import importSvg from 'design-system/assets/img/pm-images/contact-import.svg';
import exportSvg from 'design-system/assets/img/pm-images/contact-export.svg';
import contactGroupsSvg from 'design-system/assets/img/pm-images/contact-groups.svg';

import ContactGroupModal from './ContactGroupModal';
import MergeRow from './MergeRow';

const PaidCards = ({ loadingUserKeys, onImport, onExport, onGroups }) => {
    return (
        <div className="flex flex-nowrap onmobile-flex-column">
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex flex-column">
                <div className="flex-item-fluid">
                    <img src={importSvg} alt="contact-import" className="mb1" />
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
                    <img src={exportSvg} alt="contact-export" className="mb1" />
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
                    <img src={contactGroupsSvg} alt="contact-groups" className="mb1" />
                    <div className="bold">{c('Title').t`Manage groups`}</div>
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
    loadingUserKeys: PropTypes.bool,
    onImport: PropTypes.func,
    onExport: PropTypes.func,
    onGroups: PropTypes.func
};

const FreeCards = ({ loadingUserKeys, onImport, onExport }) => {
    const handleUpgrade = () => redirectTo('/settings/subscription');

    return (
        <div className="flex flex-nowrap onmobile-flex-column">
            <div className="bordered-container flex-item-fluid mr1 onmobile-mr0 onmobile-mb1 p1 aligncenter flex flex-column">
                <div className="flex-item-fluid">
                    <img src={importSvg} alt="contact-import" className="mb1" />
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
                    <img src={exportSvg} alt="contact-export" className="mb1" />
                    <div className="bold">{c('Title').t`Export contacts`}</div>
                    <p>{c('Info')
                        .t`Create an backup of your ProtonMail contacts by exporting them to a vCard file.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <PrimaryButton className="bold" onClick={onExport} disabled={loadingUserKeys}>{c('Action')
                        .t`Export`}</PrimaryButton>
                </div>
            </div>
            <div className="bordered-container flex-item-fluid onmobile-mr0 onmobile-mb1 p1 aligncenter">
                <div className="flex-item-fluid">
                    <Icon name="contacts" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Unlock features`}</div>
                    <p>{c('Info')
                        .t`Upgrade to a paid plan to enable encrypted contact details and manage contact groups.`}</p>
                </div>
                <div className="flex-item-noshrink p1">
                    <PrimaryButton className="bold" onClick={handleUpgrade}>
                        {c('Action').t`Upgrade`}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
};

FreeCards.propTypes = {
    history: PropTypes.object,
    loadingUserKeys: PropTypes.bool,
    onImport: PropTypes.func,
    onExport: PropTypes.func
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
    onGroups,
    history
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
                            loadingUserKeys={loadingUserKeys}
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
                <FreeCards
                    history={history}
                    loadingUserKeys={loadingUserKeys}
                    onImport={onImport}
                    onExport={() => onExport()}
                />
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
    onGroups: PropTypes.func,
    history: PropTypes.object
};

export default withRouter(ContactPlaceholder);
