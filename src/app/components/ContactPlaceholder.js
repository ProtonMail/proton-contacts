import React from 'react';
import PropTypes from 'prop-types';
import { c, ngettext, msgid } from 'ttag';
import { PrimaryButton, Button } from 'react-components';
import { Link } from 'react-router-dom';

const ContactPlaceholder = ({ contacts, onUncheck }) => {
    const handleImport = () => {};
    const handleExport = () => {};
    const selectedContacts = contacts.filter(({ isChecked }) => isChecked);
    const countSelectedContacts = selectedContacts.length;

    if (countSelectedContacts) {
        return (
            <div className="p2 view-column-detail flex-item-fluid aligncenter">
                <h1>
                    {ngettext(
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at tristique mauris, non eleifend
                    orci. Etiam pharetra consequat tristique. Sed tristique ipsum quis suscipit ullamcorper.
                </p>
            </div>
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
                        <Link className="pm-button pm-button--primary" to="/settings/account">{c('Action')
                            .t`Settings`}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

ContactPlaceholder.propTypes = {
    contacts: PropTypes.array,
    onUncheck: PropTypes.func
};

ContactPlaceholder.defaultProps = {
    contacts: []
};

export default ContactPlaceholder;
