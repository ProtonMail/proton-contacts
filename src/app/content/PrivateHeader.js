import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import {
    MainLogo,
    Searchbox,
    SupportDropdown,
    UpgradeButton,
    useUser,
    TopNavbar,
    TopNavbarLink
} from 'react-components';
import { withRouter } from 'react-router';

const PrivateHeader = ({ search, onSearch, location }) => {
    const [{ hasPaidMail }] = useUser();
    const inSettings = location.pathname.startsWith('/contacts/settings');
    return (
        <header className="header flex flex-nowrap reset4print">
            <MainLogo url="/contacts" />
            {!inSettings && <Searchbox placeholder={c('Placeholder').t`Search`} value={search} onChange={onSearch} />}
            <TopNavbar>
                {hasPaidMail ? null : <UpgradeButton external={true} />}
                <TopNavbarLink
                    to="/contacts"
                    icon="contacts"
                    text={c('Title').t`Contacts`}
                    aria-current={!inSettings}
                />
                <TopNavbarLink
                    to="/contacts/settings"
                    icon="settings-master"
                    text={c('Title').t`Settings`}
                    aria-current={inSettings}
                />
                <SupportDropdown />
            </TopNavbar>
        </header>
    );
};

PrivateHeader.propTypes = {
    search: PropTypes.string,
    onSearch: PropTypes.func,
    location: PropTypes.object
};

export default withRouter(PrivateHeader);
