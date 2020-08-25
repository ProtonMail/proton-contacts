import React from 'react';
import { ErrorBoundary, StandardPrivateApp, ContactProvider } from 'react-components';
import { Redirect, Route, Switch } from 'react-router';
import {
    UserModel,
    ContactsModel,
    ContactEmailsModel,
    LabelsModel,
    UserSettingsModel,
    SubscriptionModel,
    MailSettingsModel
} from 'proton-shared/lib/models';
import { TtagLocaleMap } from 'proton-shared/lib/interfaces/Locale';

import ContactsContainer from '../containers/ContactsContainer';
import SettingsContainer from '../containers/SettingsContainer';

const EVENT_MODELS = [
    UserModel,
    UserSettingsModel,
    MailSettingsModel,
    ContactsModel,
    SubscriptionModel,
    ContactEmailsModel,
    LabelsModel
];

const PRELOAD_MODELS = [UserSettingsModel, UserModel, MailSettingsModel];

interface Props {
    onLogout: () => void;
    locales: TtagLocaleMap;
}
const PrivateApp = ({ onLogout, locales }: Props) => {
    return (
        <StandardPrivateApp
            locales={locales}
            onLogout={onLogout}
            preloadModels={PRELOAD_MODELS}
            eventModels={EVENT_MODELS}
        >
            <ContactProvider>
                <ErrorBoundary>
                    <Switch>
                        <Route path="/settings" component={SettingsContainer} />
                        <Route
                            path="/"
                            render={({ location, history }) => (
                                <ContactsContainer location={location} history={history} />
                            )}
                        />
                        <Redirect to="/" />
                    </Switch>
                </ErrorBoundary>
            </ContactProvider>
        </StandardPrivateApp>
    );
};

export default PrivateApp;
