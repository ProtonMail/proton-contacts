import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import {
    PrimaryButton,
    Button,
    AutoSaveContactsToggle,
    Icon,
    useMailSettings,
    useModals,
    useContactGroups
} from 'react-components';

import ExportModal from './ExportModal';
import ContactGroupModal from './ContactGroupModal';
import ContactGroupsModal from './ContactGroupsModal';

const PaidCards = ({ contactGroupID }) => {
    const { createModal } = useModals();
    const handleExport = () => createModal(<ExportModal contactGroupID={contactGroupID} />);
    const handleGroups = () => createModal(<ContactGroupsModal />);

    const handleImport = () => {
        // TODO open import modal
    };

    return (
        <div className="flex-autogrid">
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <Icon name="import" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Import contacts`}</div>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at tristique mauris, non
                        eleifend orci. Etiam pharetra consequat tristique. Sed tristique ipsum quis suscipit
                        ullamcorper.
                    </p>
                    <PrimaryButton onClick={handleImport}>{c('Action').t`Import`}</PrimaryButton>
                </div>
            </div>
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <Icon name="export" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Export contacts`}</div>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at tristique mauris, non
                        eleifend orci. Etiam pharetra consequat tristique. Sed tristique ipsum quis suscipit
                        ullamcorper.
                    </p>
                    <PrimaryButton onClick={handleExport}>{c('Action').t`Export`}</PrimaryButton>
                </div>
            </div>
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <Icon name="contacts" className="icon-100p mb1" />
                    <div className="bold">{c('Title').t`Contacts settings`}</div>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at tristique mauris, non
                        eleifend orci. Etiam pharetra consequat tristique. Sed tristique ipsum quis suscipit
                        ullamcorper.
                    </p>
                    <PrimaryButton onClick={handleGroups}>{c('Action').t`Groups`}</PrimaryButton>
                </div>
            </div>
        </div>
    );
};

PaidCards.propTypes = {
    contactGroupID: PropTypes.string
};

const FreeCards = () => {
    return (
        <div className="flex-autogrid">
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <div className="bold">{c('Title').t`Contact picture`}</div>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at tristique mauris, non
                        eleifend orci. Etiam pharetra consequat tristique. Sed tristique ipsum quis suscipit
                        ullamcorper.
                    </p>
                    <Link className="pm-button pm-button--primary" to="/settings/dashboard">{c('Action')
                        .t`Upgrade`}</Link>
                </div>
            </div>
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <div className="bold">{c('Title').t`Encrypted contact details`}</div>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at tristique mauris, non
                        eleifend orci. Etiam pharetra consequat tristique. Sed tristique ipsum quis suscipit
                        ullamcorper.
                    </p>
                    <Link className="pm-button pm-button--primary" to="/settings/dashboard">{c('Action')
                        .t`Upgrade`}</Link>
                </div>
            </div>
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
                    <div className="bold">{c('Title').t`Manage groups`}</div>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at tristique mauris, non
                        eleifend orci. Etiam pharetra consequat tristique. Sed tristique ipsum quis suscipit
                        ullamcorper.
                    </p>
                    <Link className="pm-button pm-button--primary" to="/settings/dashboard">{c('Action')
                        .t`Upgrade`}</Link>
                </div>
            </div>
        </div>
    );
};

const ContactPlaceholder = ({ contacts, contactGroupID, user, onUncheck }) => {
    const { hasPaidMail } = user;
    const countContacts = contacts.length;
    const selectedContacts = contacts.filter(({ isChecked }) => isChecked);
    const countSelectedContacts = selectedContacts.length;
    const [{ AutoSaveContacts } = {}] = useMailSettings();
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
            <div className="p2 view-column-detail flex-item-fluid">
                <div className="aligncenter">
                    <h1 className="ellipsis">{Name}</h1>
                    <div className="mb1">
                        {c('Info').ngettext(
                            msgid`You have ${countContacts} contact in your address book`,
                            `You have ${countContacts} contacts in your address book`,
                            countContacts
                        )}
                    </div>
                    <div className="mb2">
                        <PrimaryButton onClick={handleClick}>{c('Action').t`Edit group`}</PrimaryButton>
                    </div>
                    {hasPaidMail ? <PaidCards contactGroupID={contactGroupID} /> : <FreeCards />}
                </div>
            </div>
        );
    }

    return (
        <div className="p2 view-column-detail flex-item-fluid">
            <div className="aligncenter">
                <h1>{c('Title').t`Contacts`}</h1>
                <div className="mb1">
                    {c('Info').ngettext(
                        msgid`You have ${countContacts} contact in your address book`,
                        `You have ${countContacts} contacts in your address book`,
                        countContacts
                    )}
                </div>
                <div className="w50 center flex flex-spacebetween flex-items-center mb2">
                    <div>{c('Info').t`Automatically add contact`}</div>
                    <div>
                        <AutoSaveContactsToggle autoSaveContacts={!!AutoSaveContacts} />
                    </div>
                </div>
            </div>
            {hasPaidMail ? <PaidCards /> : <FreeCards />}
        </div>
    );
};

ContactPlaceholder.propTypes = {
    contacts: PropTypes.array.isRequired,
    contactGroupID: PropTypes.string,
    user: PropTypes.object.isRequired,
    onUncheck: PropTypes.func
};

ContactPlaceholder.defaultProps = {
    contacts: []
};

export default ContactPlaceholder;
