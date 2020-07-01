import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';

import { useModals, Icon, ContactUpgradeModal, NavItem, classnames } from 'react-components';

const SidebarGroups = ({ displayGroups, onToggle, hasPaidMail, contactGroups, history }) => {
    const { createModal } = useModals();

    const onClickSettingsIcon = () => {
        if (!hasPaidMail) {
            return createModal(<ContactUpgradeModal />);
        }
        history.push('/contacts/settings/groups');
    };

    return (
        <>
            <li className="navigation__item navigation__link--groupHeader">
                <div className="flex flex-nowrap">
                    <button
                        className="uppercase flex-item-fluid alignleft navigation__link--groupHeader-link"
                        type="button"
                        onClick={hasPaidMail ? onToggle : () => createModal(<ContactUpgradeModal />)}
                    >
                        <span className="mr0-5 small">{c('Link').t`Groups`}</span>
                        {!!hasPaidMail && (
                            <Icon
                                name="caret"
                                className={classnames(['navigation__icon--expand', displayGroups && 'rotateX-180'])}
                            />
                        )}
                    </button>
                    <button
                        className="navigation__link--groupHeader-link flex-item-noshrink"
                        type="button"
                        title={c('Info').t`Manage your contact groups`}
                        onClick={onClickSettingsIcon}
                    >
                        <Icon name="settings-singular" className="navigation__icon" />
                        <span className="sr-only">{c('Link').t`Groups`}</span>
                    </button>
                </div>
            </li>
            {displayGroups &&
                contactGroups.map(({ Name, Color, ID, count }) => (
                    <NavItem
                        key={ID}
                        icon="circle"
                        iconSize={12}
                        isActive={(_match, location) => {
                            const params = new URLSearchParams(location.search);
                            return params.get('contactGroupID') === ID;
                        }}
                        color={Color}
                        text={`${Name} (${count})`}
                        link={`/contacts?contactGroupID=${ID}`}
                        title={`${Name} (${count})`}
                    />
                ))}
        </>
    );
};

SidebarGroups.propTypes = {
    displayGroups: PropTypes.bool,
    onToggle: PropTypes.func,
    contactGroups: PropTypes.array,
    history: PropTypes.object.isRequired,
    hasPaidMail: PropTypes.number
};

export default SidebarGroups;
