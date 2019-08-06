import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { SearchInput, MainLogo, Icon, UserDropdown, UpgradeButton, useUser } from 'react-components';
import { APPS } from 'proton-shared/lib/constants';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

const PrivateHeader = ({ search, onSearch, location }) => {
    const [{ isFree }] = useUser();
    const inSettings = location.pathname.startsWith('/contacts/settings');
    return (
        <header className="header flex flex-nowrap reset4print">
            <MainLogo currentApp={APPS.PROTONCONTACTS} url="/contacts" />
            <div className="searchbox-container relative flex-item-centered-vert">
                {inSettings ? null : (
                    <label htmlFor="global_search">
                        <span className="sr-only">{c('Placeholder').t`Search`}</span>
                        <SearchInput
                            value={search}
                            onChange={onSearch}
                            id="global_search"
                            placeholder={c('Placeholder').t`Search`}
                            className="searchbox-field"
                        />
                    </label>
                )}
            </div>
            <div className="topnav-container flex-item-centered-vert flex-item-fluid">
                <ul className="topnav-list unstyled mt0 mb0 ml1 flex flex-nowrap">
                    <li className="mr1">
                        <Link
                            to="/contacts"
                            className="topnav-link inline-flex flex-nowrap nodecoration rounded"
                            aria-current={!inSettings}
                        >
                            <Icon name="contacts" className="topnav-icon mr0-5 flex-item-centered-vert fill-white" />
                            {c('Title').t`Contacts`}
                        </Link>
                    </li>
                    {isFree ? (
                        <li className="mr1">
                            <UpgradeButton className="topnav-link inline-flex flex-nowrap nodecoration rounded" />
                        </li>
                    ) : null}
                    <li className="mr1">
                        <Link
                            to="/contacts/settings"
                            className="topnav-link inline-flex flex-nowrap nodecoration rounded"
                            aria-current={inSettings}
                        >
                            <Icon
                                name="settings-master"
                                className="topnav-icon mr0-5 flex-item-centered-vert fill-white"
                            />
                            {c('Title').t`Settings`}
                        </Link>
                    </li>
                    <li className="mlauto mtauto mbauto relative flex-item-noshrink">
                        <UserDropdown />
                    </li>
                </ul>
            </div>
        </header>
    );
};

PrivateHeader.propTypes = {
    search: PropTypes.string,
    onSearch: PropTypes.func,
    location: PropTypes.object
};

export default withRouter(PrivateHeader);
