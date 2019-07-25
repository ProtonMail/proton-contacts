import React from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary, StandardPrivateApp } from 'react-components';
import { Route } from 'react-router';
import {
    UserModel,
    ContactsModel,
    ContactEmailsModel,
    UserSettingsModel,
    SubscriptionModel
} from 'proton-shared/lib/models';

import ContactsProvider from '../containers/ContactProvider';
import ContactsContainer from '../containers/ContactsContainer';

const EVENT_MODELS = [UserModel, UserSettingsModel, ContactsModel, SubscriptionModel, ContactEmailsModel];

const PRELOAD_MODELS = [UserSettingsModel, UserModel];

const PrivateApp = ({ onLogout }) => {
    return (
        <StandardPrivateApp
            onLogout={onLogout}
            locales={{} /* todo */}
            preloadModels={PRELOAD_MODELS}
            eventModels={EVENT_MODELS}
        >
            <ContactsProvider>
                <ErrorBoundary>
                    <Route path="/contacts" component={ContactsContainer} />
                </ErrorBoundary>
            </ContactsProvider>
        </StandardPrivateApp>
    );
};

PrivateApp.propTypes = {
    onLogout: PropTypes.func.isRequired
};

export default PrivateApp;
