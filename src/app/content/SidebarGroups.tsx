import React from 'react';
import { c } from 'ttag';
import { useHistory } from 'react-router';
import {
    useModals,
    ContactUpgradeModal,
    SimpleSidebarListItemLink,
    SimpleSidebarListItemHeader,
    SidebarListItemHeaderButton,
} from 'react-components';
import { GroupsWithCount } from '../interfaces/GroupsWithCount';

interface Props {
    displayGroups: boolean;
    onToggle: () => void;
    contactGroups: GroupsWithCount[];
    hasPaidMail: boolean;
}

const SidebarGroups = ({ displayGroups, onToggle, hasPaidMail, contactGroups }: Props) => {
    const { createModal } = useModals();
    const history = useHistory();

    const onClickSettingsIcon = () => {
        if (!hasPaidMail) {
            return createModal(<ContactUpgradeModal />);
        }
        history.push('/settings/groups');
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
                        info={c('Link').t`Manage your contact groups`}
                    />
                }
            />
            {displayGroups &&
                contactGroups.map(({ Name, Color, ID, count }) => {
                    const title = `${Name} (${count})`;
                    return (
                        <SimpleSidebarListItemLink
                            key={ID}
                            icon="circle"
                            iconColor={Color}
                            iconSize={12}
                            to={`/?contactGroupID=${ID}`}
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

export default SidebarGroups;
