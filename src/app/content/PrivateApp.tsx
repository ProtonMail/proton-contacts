import React from 'react';
import { StandardPrivateApp } from 'react-components';
import {
    UserModel,
    ContactsModel,
    ContactEmailsModel,
    LabelsModel,
    UserSettingsModel,
    SubscriptionModel,
    MailSettingsModel,
} from 'proton-shared/lib/models';
import { TtagLocaleMap } from 'proton-shared/lib/interfaces/Locale';

const EVENT_MODELS = [
    UserModel,
    UserSettingsModel,
    MailSettingsModel,
    ContactsModel,
    SubscriptionModel,
    ContactEmailsModel,
    LabelsModel,
];

const PRELOAD_MODELS = [UserSettingsModel, UserModel, MailSettingsModel];

const getAppContainer = () => import('../containers/MainContainer');

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
            app={getAppContainer}
        />
    );
};

export default PrivateApp;
