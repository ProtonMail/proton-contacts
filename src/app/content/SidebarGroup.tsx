import React from 'react';
import { c } from 'ttag';
import { labelContactEmails } from 'proton-shared/lib/api/contacts';
import { ContactEmail } from 'proton-shared/lib/interfaces/contacts';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import {
    classnames,
    SimpleSidebarListItemLink,
    useApi,
    useContacts,
    useEventManager,
    useItemsDroppable,
    useModals,
    useNotifications,
} from 'react-components';
import { collectContacts } from 'react-components/containers/contacts/ContactGroupDropdown';
import SelectEmailsModal from 'react-components/containers/contacts/modals/SelectEmailsModal';
import { GroupsWithCount } from '../interfaces/GroupsWithCount';

interface Props {
    group: GroupsWithCount;
    contactEmailsMap: SimpleMap<ContactEmail[]>;
}

const SidebarGroup = ({ group, contactEmailsMap }: Props) => {
    const [contacts] = useContacts();
    const { createModal } = useModals();
    const api = useApi();
    const { call } = useEventManager();
    const { createNotification } = useNotifications();

    const { dragOver, dragProps, handleDrop } = useItemsDroppable(
        () => true,
        'move',
        async (IDs) => {
            let selectedContactEmails = IDs.reduce<ContactEmail[]>((acc, ID) => {
                if (!contactEmailsMap[ID]) {
                    return acc;
                }
                return acc.concat(contactEmailsMap[ID] as ContactEmail[]);
            }, []);
            const { contacts: collectedContacts } = collectContacts(selectedContactEmails, contacts);

            if (collectedContacts.length) {
                selectedContactEmails = await new Promise<ContactEmail[]>((resolve, reject) => {
                    createModal(
                        <SelectEmailsModal
                            contacts={collectedContacts}
                            groupIDs={[group.ID]}
                            onSubmit={resolve}
                            onClose={reject}
                        />
                    );
                });
            }

            const toLabel = selectedContactEmails
                .filter(({ LabelIDs = [] }) => !LabelIDs.includes(group.ID))
                .map(({ ID }) => ID);

            if (toLabel.length) {
                await api(labelContactEmails({ LabelID: group.ID, ContactEmailIDs: toLabel }));
            }

            await call();
            createNotification({
                text: c('Info').t`Contact group applied`,
            });
        }
    );

    const title = `${group.Name} (${group.count})`;

    return (
        <SimpleSidebarListItemLink
            key={group.ID}
            className={classnames([dragOver && 'navigation__dragover'])}
            icon="circle"
            iconColor={group.Color}
            iconSize={12}
            to={`/?contactGroupID=${group.ID}`}
            isActive={(match, location) => {
                const params = new URLSearchParams(location.search);
                return params.get('contactGroupID') === group.ID;
            }}
            {...dragProps}
            onDrop={handleDrop}
        >
            {title}
        </SimpleSidebarListItemLink>
    );
};

export default SidebarGroup;
