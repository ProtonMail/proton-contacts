import React from 'react';
import { c } from 'ttag';
import { useHistory } from 'react-router';
import {
    useModals,
    ContactUpgradeModal,
    SimpleSidebarListItemHeader,
    SidebarListItemHeaderButton,
} from 'react-components';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import { ContactEmail } from 'proton-shared/lib/interfaces/contacts';
import { GroupsWithCount } from '../interfaces/GroupsWithCount';
import SidebarGroup from './SidebarGroup';

interface Props {
    displayGroups: boolean;
    onToggle: () => void;
    contactGroups: GroupsWithCount[];
    hasPaidMail: boolean;
    contactEmailsMap: SimpleMap<ContactEmail[]>;
}

const SidebarGroups = ({ displayGroups, onToggle, hasPaidMail, contactGroups, contactEmailsMap }: Props) => {
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
                contactGroups.map((group) => (
                    <SidebarGroup key={group.ID} group={group} contactEmailsMap={contactEmailsMap} />
                ))}
        </>
    );
};

export default SidebarGroups;
