import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { SearchInput, MainLogo, Icon } from 'react-components';
import { APPS } from 'proton-shared/lib/constants';
import { Link } from 'react-router-dom';

const PrivateHeader = ({ search, onSearch }) => {
    return (
        <header className="header flex flex-nowrap reset4print">
            <MainLogo currentApp={APPS.PROTONCONTACTS} url="/contacts" />
            <div className="searchbox-container relative flex-item-centered-vert">
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
            </div>
            <div className="topnav-container flex-item-centered-vert flex-item-fluid">
                <ul className="topnav-list unstyled mt0 mb0 ml1 flex flex-nowrap">
                    <li className="mr1">
                        <Link to="/contacts" className="topnav-link inline-flex flex-nowrap nodecoration rounded">
                            <Icon name="contacts" className="topnav-icon mr0-5 flex-item-centered-vert fill-white" />
                            {c('Title').t`Contacts`}
                        </Link>
                    </li>
                    <li className="mr1">
                        <Link
                            to="contacts/settings"
                            className="topnav-link inline-flex flex-nowrap nodecoration rounded"
                        >
                            <Icon
                                name="settings-master"
                                className="topnav-icon mr0-5 flex-item-centered-vert fill-white"
                            />
                            {c('Title').t`Settings`}
                        </Link>
                    </li>
                </ul>
            </div>
        </header>
    );
};

PrivateHeader.propTypes = {
    search: PropTypes.string,
    onSearch: PropTypes.func
};

export default PrivateHeader;
