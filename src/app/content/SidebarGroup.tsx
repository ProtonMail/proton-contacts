import React from 'react';
import { ContactEmail } from 'proton-shared/lib/interfaces/contacts';
import { SimpleMap } from 'proton-shared/lib/interfaces/utils';
import { classnames, SimpleSidebarListItemLink, useApplyGroups, useItemsDroppable } from 'react-components';
import { GroupsWithCount } from '../interfaces/GroupsWithCount';

interface Props {
    group: GroupsWithCount;
    contactEmailsMap: SimpleMap<ContactEmail[]>;
}

const SidebarGroup = ({ group, contactEmailsMap }: Props) => {
    const applyGroups = useApplyGroups();

    const { dragOver, dragProps, handleDrop } = useItemsDroppable(
        () => true,
        'move',
        async (IDs) => {
            const selectedContactEmails = IDs.reduce<ContactEmail[]>((acc, ID) => {
                if (!contactEmailsMap[ID]) {
                    return acc;
                }
                return acc.concat(contactEmailsMap[ID] as ContactEmail[]);
            }, []);

            await applyGroups(selectedContactEmails, { [group.ID]: true });
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
