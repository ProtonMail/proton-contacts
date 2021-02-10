import { ContactGroup } from 'proton-shared/lib/interfaces/contacts';

export interface GroupsWithCount extends ContactGroup {
    count: number;
}
