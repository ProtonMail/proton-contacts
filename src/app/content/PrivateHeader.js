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
    Icon,
    FloatingButton,
    useModals
} from 'react-components';
import { isMobile as isItMobile } from 'proton-shared/lib/helpers/responsive';
import { withRouter } from 'react-router';

import ContactModal from '../components/ContactModal';

const PrivateHeader = ({ title, search, onSearch, location, expanded, onToggleExpand }) => {
    const [{ hasPaidMail }] = useUser();
    const { createModal } = useModals();
    const inSettings = location.pathname.startsWith('/contacts/settings');
    const activeBreakpoint = useActiveBreakpoint();
    const isMobile = isItMobile(activeBreakpoint);

    return (
        <header className="header flex flex-nowrap reset4print">
            <MainLogo url="/contacts" className="nomobile" />
            <Hamburger expanded={expanded} onToggle={onToggleExpand} />
            {title && isMobile ? <span className="big ellipsis">{title}</span> : null}
            {inSettings || isMobile ? null : (
                <Searchbox placeholder={c('Placeholder').t`Search`} value={search} onChange={onSearch} />
            )}
            <TopNavbar>
                {hasPaidMail || isMobile ? null : <UpgradeButton external={true} />}
                {isMobile && !inSettings ? null : (
                    <TopNavbarLink
                        className="nomobile"
                        to="/contacts"
                        icon="contacts"
                        text={c('Title').t`Contacts`}
                        aria-current={!inSettings}
                    />
                )}
                {!inSettings && isMobile ? (
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
                {isMobile && inSettings ? null : (
                    <TopNavbarLink
                        to="/contacts/settings"
                        icon="settings-master"
                        text={c('Title').t`Settings`}
                        aria-current={inSettings}
                    />
                )}
            </TopNavbar>
            {isMobile ? <FloatingButton onClick={() => createModal(<ContactModal />)} icon="add" /> : null}
        </header>
    );
};

PrivateHeader.propTypes = {
    title: PropTypes.string,
    search: PropTypes.string,
    expanded: PropTypes.bool,
    onToggleExpand: PropTypes.func,
    onSearch: PropTypes.func,
    location: PropTypes.object
};

export default withRouter(PrivateHeader);
