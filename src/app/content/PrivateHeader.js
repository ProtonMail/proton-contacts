import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import {
    Hamburger,
    MainLogo,
    Searchbox,
    UpgradeButton,
    useUser,
    SearchDropdown,
    TopNavbar,
    TopNavbarLink,
    Icon,
    FloatingButton,
    useModals
} from 'react-components';

import ContactModal from '../components/ContactModal';

const PrivateHeader = ({
    title,
    search,
    onSearch,
    onClearSearch,
    expanded,
    onToggleExpand,
    inSettings = false,
    isNarrow = false,
    history
}) => {
    const [{ hasPaidMail }] = useUser();
    const { createModal } = useModals();

    return (
        <header className="header flex flex-items-center flex-nowrap reset4print">
            <MainLogo url="/contacts" className="nomobile" />
            <Hamburger expanded={expanded} onToggle={onToggleExpand} />
            {title && isNarrow ? <span className="h3 mb0 ellipsis lh-standard">{title}</span> : null}
            {inSettings || isNarrow ? null : (
                <Searchbox placeholder={c('Placeholder').t`Search contacts`} value={search} onChange={onSearch} />
            )}
            <TopNavbar>
                {hasPaidMail || isNarrow ? null : <UpgradeButton external={true} />}
                {isNarrow && !inSettings ? null : (
                    <TopNavbarLink
                        className="nomobile"
                        to="/contacts"
                        icon="contacts"
                        text={c('Title').t`Contacts`}
                        aria-current={!inSettings}
                    />
                )}
                {!inSettings && isNarrow ? (
                    <SearchDropdown
                        originalPlacement="bottom-right"
                        content={<Icon name="search" size={24} className="topnav-icon mr0-5 flex-item-centered-vert" />}
                        placeholder={c('Placeholder').t`Search contacts`}
                        search={search}
                        onSearch={onSearch}
                        hasCaret={false}
                    />
                ) : null}
                {isNarrow && inSettings ? null : (
                    <TopNavbarLink
                        to="/contacts/settings/general"
                        icon="settings-master"
                        text={c('Title').t`Settings`}
                        aria-current={inSettings}
                    />
                )}
            </TopNavbar>
            {isNarrow && !inSettings ? (
                <FloatingButton
                    onClick={() => createModal(<ContactModal history={history} onAdd={onClearSearch} />)}
                    icon="plus"
                />
            ) : null}
        </header>
    );
};

PrivateHeader.propTypes = {
    title: PropTypes.string,
    search: PropTypes.string,
    expanded: PropTypes.bool,
    onToggleExpand: PropTypes.func,
    onSearch: PropTypes.func,
    onClearSearch: PropTypes.func,
    inSettings: PropTypes.bool,
    isNarrow: PropTypes.bool,
    history: PropTypes.object
};

export default PrivateHeader;
