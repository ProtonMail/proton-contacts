import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import {
    Hamburger,
    MainLogo,
    Searchbox,
    UpgradeButton,
    useUser,
    useActiveBreakpoint,
    SearchDropdown,
    TopNavbar,
    TopNavbarLink,
    Icon
} from 'react-components';
import { withRouter } from 'react-router';

const PrivateHeader = ({ search, onSearch, location, expanded, onToggleExpand }) => {
    const [{ hasPaidMail }] = useUser();
    const inSettings = location.pathname.startsWith('/contacts/settings');
    const activeBreakpoint = useActiveBreakpoint();
    const isMobile = activeBreakpoint === 'mobile';

    return (
        <header className="header flex flex-nowrap reset4print">
            <MainLogo url="/contacts" className="nomobile" />
            <Hamburger expanded={expanded} onToggle={onToggleExpand} />
            {inSettings || isMobile ? null : (
                <Searchbox placeholder={c('Placeholder').t`Search`} value={search} onChange={onSearch} />
            )}
            <TopNavbar>
                {hasPaidMail || isMobile ? null : <UpgradeButton external={true} />}
                {isMobile ? null : (
                    <TopNavbarLink
                        className="nomobile"
                        to="/contacts"
                        icon="contacts"
                        text={c('Title').t`Contacts`}
                        aria-current={!inSettings}
                    />
                )}
                {isMobile ? (
                    <SearchDropdown
                        content={
                            <Icon
                                name="search"
                                size="25"
                                className="topnav-icon mr0-5 flex-item-centered-vert fill-white"
                            />
                        }
                        search={search}
                        onSearch={onSearch}
                        hasCaret={false}
                    />
                ) : null}
                <TopNavbarLink
                    to="/contacts/settings"
                    icon="settings-master"
                    text={c('Title').t`Settings`}
                    aria-current={inSettings}
                />
            </TopNavbar>
        </header>
    );
};

PrivateHeader.propTypes = {
    search: PropTypes.string,
    expanded: PropTypes.bool,
    onToggleExpand: PropTypes.func,
    onSearch: PropTypes.func,
    location: PropTypes.object
};

export default withRouter(PrivateHeader);
