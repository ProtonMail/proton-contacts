import Papa from 'papaparse';
import isTruthy from 'proton-shared/lib/helpers/isTruthy';
import { ContactProperties, ContactValue } from 'proton-shared/lib/interfaces/contacts';
import { ContactPropertyWithDisplay, ParsedCsvContacts } from '../interfaces/Import';
import { standarize, combine, display, toPreVcard } from './csvFormat';
import { sortByPref } from 'proton-shared/lib/contacts/properties';

/** NOTATION
 *
 * Because the words 'property' and 'contact' are used several times in this file with different
 * meanings depending on the context, let us establish here those context meanings.
 *
 * "csv property": The first row of a csv file is made of several headers.
 *                 We call them csv properties.
 *                 E.g. 'First Name', 'Last Name', 'Email 2 Address'
 *
 * "csv contact": Each row of a csv file (except for the first one) is made of string values
 *                that correspond to the property in the header. We call the array made of
 *                these values a csv contact.
 *                E.g. ['john', 'doe', 'john.doe@microsoft.com', ...]
 *
 * "csv contact value": Each of the string values inside a csv contact
 *
 * "vCard property": A format we are using for vCard properties in the file './vcard.ts'.
 *                   Namely a vCard property is the JS object:
 *                   { pref, field, group, type, value }
 *                   The key pref stands for preference, and is used when a property is repeated in a vcard
 *                   The key field indicates the field of this property. See the possibilities in './fields'
 *                   The key type indicates the type of this property, which depends on the field. See the possibilities in './types'
 *                   The key group is used for contact groups
 *                   The Key value is the value of the property. An string-valued array for adr and nickname, a string for the rest
 *
 * "vCard contact": An array made of vCard properties
 *
 * "pre-vCard property": Because different csv properties may correspond to a single vCard property,
 *                       to pass from one to the other we go through an intermediate step.
 *                       A pre-vCard property is the JS object:
 *                       { header, checked, pref, field, type, value, combineInto, combineIndex, custom }
 *                       The key "header" equals the csv property.
 *                       The key "checked" will mark whether we want to include this property into the vCard
 *                       The key "combineInto" will be the same for different csv properties that will
 *                       assemble into a single vCard property. For this assembly we need to order
 *                       the properties, which will be indicated by the key "combineIndex".
 *                       The key "custom" is a Boolean that indicates whether the header couldn't be matched
 *                       with a standard vCard property.
 *
 * "pre-vCard contact": An array made of pre-vCard properties
 *
 * "pre-vCards property" An array of pre-vCard properties. These pre-Vcards are to be combined into a single vCard
 * "pre-vCards contact": An array made of arrays of pre-Vcard properties
 */

export interface PreVcardProperty {
    header: string;
    checked: boolean;
    pref?: number;
    field: string;
    type?: string;
    value: ContactValue;
    combineInto?: string;
    combineIndex?: number;
    custom?: boolean;
}

export type PreVcardsProperty = PreVcardProperty[];

export type PreVcardsContact = PreVcardsProperty[];

interface PapaParseOnCompleteArgs {
    data?: string[][];
    errors?: any[];
}

/**
 * Get all csv properties and corresponding contacts values from a csv file.
 * If there are errors when parsing the csv, throw
 * @dev  contacts[i][j] : value for property headers[j] of contact i
 */
export const readCsv = async (file: File) => {
    const { headers, contacts, errors }: { headers: string[]; contacts: string[][]; errors: any[] } = await new Promise(
        (resolve, reject) => {
            const onComplete = ({ data = [], errors = [] }: PapaParseOnCompleteArgs = {}) =>
                resolve({ headers: data[0], contacts: data.slice(1), errors });
            Papa.parse(file, {
                header: false,
                /*
                If true, the first row of parsed data will be interpreted as field names. An array of field names will be returned in meta,
                and each row of data will be an object of values keyed by field name instead of a simple array.
                Rows with a different number of fields from the header row will produce an error.
            */
                dynamicTyping: false, // If true, numeric and Boolean data will be converted to their type instead of remaining strings.
                complete: onComplete,
                error: reject,
                skipEmptyLines: true // If true, lines that are completely empty will be skipped. An empty line is defined to be one which evaluates to empty string.
            });
        }
    );

    if (errors.length) {
        throw new Error('Error when reading csv file');
    }

    // we have to manually correct Papa.parse which can return headers and contacts of different length
    const headersLength = headers.length;
    const filteredContacts = contacts
        .map((contact) => contact.slice(0, headersLength))
        .filter((contact) => contact.length === headersLength);

    return { headers, contacts: filteredContacts };
};

/**
 * Transform csv properties and csv contacts into pre-vCard contacts.
 * @param {Object} csvData
 * @param {Array<String>} csvData.headers           Array of csv properties
 * @param {Array<Array<String>>} csvData.contacts   Array of csv contacts
 *
 * @return {Array<Array<Object>>}                   pre-vCard contacts
 *
 * @dev  Some csv property may be assigned to several pre-vCard contacts,
 *       so an array of new headers is returned together with the pre-vCard contacts
 */
const parse = ({ headers = [], contacts = [] }: ParsedCsvContacts): PreVcardsProperty[] => {
    if (!contacts.length) {
        return [];
    }
    const { headers: enrichedHeaders, contacts: standardContacts } = standarize({ headers, contacts }) || {};
    if (!enrichedHeaders?.length || !standardContacts?.length) {
        return [];
    }

    const translator = enrichedHeaders.map(toPreVcard);

    return standardContacts
        .map((contact) =>
            contact
                .map((value, i) => translator[i](value))
                // some headers can be mapped to several properties, so we need to flatten
                .flat()
        )
        .map((contact) => contact.filter((preVcard) => !!preVcard));
};

/**
 * Transform csv properties and csv contacts into pre-vCard contacts,
 * re-arranging them in the process
 *
 * @dev  headers are arranged as headers = [[group of headers to be combined in a vCard], ...]
 *       preVcardContacts is an array of pre-vCard contacts, each of them containing pre-vCards
 *       arranged in the same way as the headers:
 *       preVcardContacts = [[[group of pre-vCard properties to be combined], ...], ...]
 */
export const prepare = ({ headers = [], contacts = [] }: ParsedCsvContacts) => {
    const preVcardContacts = parse({ headers, contacts });
    if (!preVcardContacts.length) {
        return [];
    }

    // detect csv properties to be combined in preVcardContacts and split header indices
    const nonCombined: number[] = [];
    const combined = preVcardContacts[0].reduce<{ [key: string]: number[] }>(
        (acc, { combineInto, combineIndex: j }, i) => {
            if (combineInto) {
                if (!acc[combineInto]) {
                    acc[combineInto] = [];
                }
                acc[combineInto][j as number] = i;
                // combined will look like e.g.
                // { 'fn-main': [2, <empty item(s)>, 3, 5, 1], 'fn-yomi': [<empty item(s)>, 6, 7] }
                return acc;
            }
            nonCombined.push(i);
            return acc;
        },
        {}
    );

    for (const combination of Object.keys(combined)) {
        // remove empty items from arrays in combined
        combined[combination] = combined[combination].filter((n) => n !== null);
    }

    // Arrange pre-vCards respecting the original ordering outside header groups
    const preparedPreVcardContacts: PreVcardsContact[] = contacts.map(() => []);
    for (const [i, indices] of Object.values(combined).entries()) {
        preparedPreVcardContacts.forEach((contact) => contact.push([]));
        indices.forEach((index) => {
            preparedPreVcardContacts.forEach((contact, k) =>
                contact[i].push({
                    ...preVcardContacts[k][index]
                })
            );
        });
    }
    for (const index of nonCombined) {
        preparedPreVcardContacts.forEach((contact, k) => contact.push([preVcardContacts[k][index]]));
    }

    return preparedPreVcardContacts;
};

/**
 * Combine pre-vCards properties into a single vCard one
 * @param {Array} preVcards     Array of pre-vCards properties
 *
 * @return {Object}             vCard property
 */
export const toVcard = (preVcards: PreVcardProperty[]): ContactPropertyWithDisplay | undefined => {
    if (!preVcards.length) {
        return;
    }
    const { pref, field, type, custom } = preVcards[0];
    return custom
        ? { pref, field, type, value: combine['custom'](preVcards), display: display['custom'](preVcards) }
        : { pref, field, type, value: combine[field](preVcards), display: display[field](preVcards) };
};

/**
 * Transform pre-vCards contacts into vCard contacts
 */
export const toVcardContacts = (preVcardsContacts: PreVcardsContact[]): ContactProperties[] =>
    preVcardsContacts.map((preVcardsContact) =>
        preVcardsContact
            .map(toVcard)
            .filter(isTruthy)
            .sort(sortByPref)
    );
