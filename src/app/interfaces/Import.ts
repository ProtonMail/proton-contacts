import { ContactCard, ContactProperties, ContactProperty, ContactValue } from 'proton-shared/lib/interfaces/contacts';
import { ImportContactError } from '../components/import/ImportContactError';
import { ImportFatalError } from '../components/import/ImportFatalError';
import { ImportFileError } from '../components/import/ImportFileError';
import { PreVcardsContact, PreVcardsProperty } from '../helpers/csv';

export enum IMPORT_STEPS {
    ATTACHING,
    ATTACHED,
    IMPORT_CSV,
    WARNING,
    IMPORTING,
    IMPORT_GROUPS,
    FINISHED
}

export enum EXTENSION {
    CSV = 'csv',
    VCF = 'vcf'
}

export type ACCEPTED_EXTENSIONS = EXTENSION.CSV | EXTENSION.VCF;

export interface ParsedCsvContacts {
    headers: string[];
    contacts: string[][];
}

export interface ContactPropertyWithDisplay extends ContactProperty {
    display: string;
}

export interface ImportContactsModel {
    step: IMPORT_STEPS;
    fileAttached?: File;
    extension?: ACCEPTED_EXTENSIONS;
    preVcardsContacts?: PreVcardsContact[];
    parsedVcardContacts: ContactProperties[];
    totalEncrypted: number;
    totalImported: number;
    errors: ImportContactError[];
    failure?: ImportFatalError | ImportFileError | Error;
    loading: boolean;
}

export interface EncryptedContact {
    contact: { Cards: ContactCard[]; error?: Error };
    contactId: string;
}

export interface AddContactsApiResponse {
    Index: number;
    Response: {
        Code: number;
        Contact?: { Cards: ContactCard[] };
        Error?: string;
    };
}

export interface AddContactsApiResponses {
    Code: number;
    Responses: AddContactsApiResponse[];
}

export interface Combine {
    [key: string]: (preVcards: PreVcardsProperty) => ContactValue;
}

export interface Display {
    [key: string]: (preVcards: PreVcardsProperty) => string;
}
