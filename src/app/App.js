import { hot } from 'react-hot-loader/root';
import React from 'react';
import { ProtonApp, LoaderPage, useAuthentication } from 'react-components';
import { redirectTo } from 'proton-shared/lib/helpers/browser';
import sentry from 'proton-shared/lib/helpers/sentry';

import * as config from './config';
import PrivateApp from './content/PrivateApp';
import PublicApp from './content/PublicApp';

import './app.scss';

sentry(config);

const Redirect = () => {
    redirectTo();
    return <LoaderPage />;
};

const Setup = () => {
    const { UID, login, logout } = useAuthentication();

    if (UID) {
        return <PrivateApp onLogout={logout} />;
    }

    if (PL_IS_STANDALONE) {
        return <PublicApp onLogin={login} />;
    }

    return <Redirect />;
};

const App = () => {
    return (
        <ProtonApp config={config}>
            <Setup />
        </ProtonApp>
    );
};

export default hot(App);
