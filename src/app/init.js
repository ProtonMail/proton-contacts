import ReactDOM from 'react-dom';
import React from 'react';
import PropTypes from 'prop-types';
import { setConfig } from 'react-hot-loader';
import { createApp, LoginContainer } from 'react-components';
import * as config from './config';
import { BrowserRouter as Router } from 'react-router-dom';

const AuthenticatedAppRoutes = React.lazy(() => import('./content/AuthenticatedAppRoutes'));

const UnAuthenticatedAppRoutes = ({ onLogin }) => {
    return (
        <Router>
            <LoginContainer onLogin={onLogin} />
        </Router>
    );
};

UnAuthenticatedAppRoutes.propTypes = {
    onLogin: PropTypes.func
};

setConfig({
    ignoreSFC: true, // RHL will be __completely__ disabled for SFC
    pureRender: true // RHL will not change render method
});

export default () => {
    const App = createApp(config, AuthenticatedAppRoutes, UnAuthenticatedAppRoutes);
    ReactDOM.render(<App />, document.querySelector('.app-root'));
};
