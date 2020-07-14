import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';

import {
    useModals,
    ContactUpgradeModal,
    SimpleSidebarListItemLink,
    SimpleSidebarListItemHeader,
    SidebarListItemHeaderButton
} from 'react-components';

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
            <SimpleSidebarListItemHeader
                toggle={displayGroups}
                onToggle={hasPaidMail ? onToggle : () => createModal(<ContactUpgradeModal />)}
                hasCaret={!!hasPaidMail}
                text={c('Link').t`Groups`}
                right={
                    <SidebarListItemHeaderButton
                        onClick={onClickSettingsIcon}
                        title={c('Info').t`Manage your contact groups`}
                        icon="settings-singular"
                        info={c('Link').t`Groups`}
                    />
                }
            />
            {displayGroups &&
                contactGroups.map(({ Name, Color, ID, count }) => {
                    const title = `${Name} (${count})`;
                    return (
                        <SimpleSidebarListItemLink
                            key={ID}
                            title={title}
                            icon="circle"
                            iconColor={Color}
                            iconSize={12}
                            to={`/contacts?contactGroupID=${ID}`}
                            isActive={(match, location) => {
                                const params = new URLSearchParams(location.search);
                                return params.get('contactGroupID') === ID;
                            }}
                        >
                            {title}
                        </SimpleSidebarListItemLink>
                    );
                })}
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
