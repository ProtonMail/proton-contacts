import { Contact } from 'proton-shared/lib/interfaces/contacts';

export interface FormattedContact extends Contact {
    emails: string[];
    isChecked: boolean;
}
