import { ContactFormatted } from 'proton-shared/lib/interfaces/contacts';

export interface MergeModel {
    orderedContacts: ContactFormatted[][];
    isChecked: {
        [ID: string]: boolean;
    };
    beDeleted: {
        [ID: string]: boolean;
    };
}
