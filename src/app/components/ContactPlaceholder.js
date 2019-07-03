import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { c, ngettext, msgid } from 'ttag';
import { PrimaryButton, Button, AutoSaveContactsToggle, useMailSettings, useModals } from 'react-components';

import ExportModal from './ExportModal';

const PaidCards = () => {
    const { createModal } = useModals();

    const handleImport = () => {
        // TODO
    };
    const handleExport = () => {
        createModal(<ExportModal />);
    };

    return (
        <div className="flex-autogrid">
            <div className="flex-autogrid-item">
                <div className="p1 aligncenter bordered-container">
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
                    <div className="bold">{c('Title').t`Contacts settings`}</div>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at tristique mauris, non
                        eleifend orci. Etiam pharetra consequat tristique. Sed tristique ipsum quis suscipit
                        ullamcorper.
                    </p>
                    <Link className="pm-button pm-button--primary" to="/settings/account">{c('Action').t`Groups`}</Link>
                </div>
            </div>
        </div>
    );
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

const ContactPlaceholder = ({ contacts, user, onUncheck }) => {
    const { hasPaidMail } = user;
    const countContacts = contacts.length;
    const selectedContacts = contacts.filter(({ isChecked }) => isChecked);
    const countSelectedContacts = selectedContacts.length;
    const [{ AutoSaveContacts } = {}] = useMailSettings();

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

    return (
        <div className="p2 view-column-detail flex-item-fluid">
            <div className="aligncenter">
                <h1>{c('Title').t`Contacts`}</h1>
                <p>
                    {c('Info').ngettext(
                        msgid`You have ${countContacts} contact in your address book`,
                        `You have ${countContacts} contacts in your address book`,
                        countContacts
                    )}
                </p>
                <p>{c('Info').t`Contacts are automatically added to your address book`}</p>
                <AutoSaveContactsToggle autoSaveContacts={!!AutoSaveContacts} />
            </div>
            {hasPaidMail ? <PaidCards /> : <FreeCards />}
        </div>
    );
};

ContactPlaceholder.propTypes = {
    contacts: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired,
    onUncheck: PropTypes.func
};

ContactPlaceholder.defaultProps = {
    contacts: []
};

export default ContactPlaceholder;
