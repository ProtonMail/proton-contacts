import { capitalize } from 'proton-shared/lib/helpers/string';

// See './csv.js' for the definition of pre-vCard and pre-vCards contact

// Csv properties to be ignored
const beIgnoredCsvProperties = [
    'name',
    'initials',
    'short name',
    'maiden name',
    'group membership',
    'mileage',
    'billing information',
    'directory server',
    'sensitivity',
    'priority',
    'subject'
];
/**
 * Given csv properties and csv contacts from any csv file, transform the properties
 * into csv properties from a standard outlook csv. Transform the contacts accordingly
 * @param {Object} csvData
 * @param {Array<String>} csvData.headers           Array of csv properties
 * @param {Array<Array<String>>} csvData.contacts   Array of csv contacts
 *
 * @return {Object}                                 standarized { headers, contacts }
 */
export const standarize = ({ headers, contacts }) => {
    if (!contacts.length) {
        return { headers, contacts };
    }
    // change name of certain headers into outlook equivalents
    // remove headers we are not interested in
    // merge headers 'xxx - type' and 'xxx - value' into one header
    const { beRemoved, beChanged } = headers.reduce(
        (acc, header, i) => {
            const headerLowerCase = header.toLowerCase();
            const { beRemoved, beChanged } = acc;
            const value = contacts[0][i];
            if (
                beIgnoredCsvProperties.includes(headerLowerCase) ||
                headerLowerCase.startsWith('im') ||
                headerLowerCase.includes('event')
            ) {
                beRemoved[i] = true;
                return acc;
            }
            /*
                consecutive headers for address n property are (n is an integer)
                * address n - type
                * address n - formatted
                * address n - street
                * address n - city
                * address n - PO box
                * address n - region
                * address n - postal code
                * address n - country
                * address n - extended address
                we have to drop the first two headers and change the rest accordingly
            */

            if (/^address\s?(\d+)? - type$/.test(headerLowerCase)) {
                const [, pref] = headerLowerCase.match(/^address\s?\d+? - type$/);
                const n = pref ? pref : '';
                beRemoved[i] = true;
                beRemoved[i + 1] = true;
                beChanged[i + 2] = (capitalize(toVcardType(value)) + ` Street ${n}`).trim();
                beChanged[i + 3] = (capitalize(toVcardType(value)) + ` City ${n}`).trim();
                beChanged[i + 4] = (capitalize(toVcardType(value)) + ` PO Box ${n}`).trim();
                beChanged[i + 5] = (capitalize(toVcardType(value)) + ` State ${n}`).trim();
                beChanged[i + 6] = (capitalize(toVcardType(value)) + ` Postal Code ${n}`).trim();
                beChanged[i + 7] = (capitalize(toVcardType(value)) + ` Country ${n}`).trim();
                beChanged[i + 8] = (capitalize(toVcardType(value)) + ` Extended Address ${n}`).trim();
                return acc;
            }
            /*
                consecutive headers for organization n property are (n is an integer)
                * organization n - type
                * organization n - name
                * organization n - yomi name
                * organization n - title
                * organization n - department
                * organization n - symbol
                * organization n - location
                * organization n - job description
                we can simply keep the name, title and department changing the corresponding header
            */
            if (/^organization\s?\d+? - (\w+)$/.test(headerLowerCase)) {
                const [, str] = headerLowerCase.match(/^organization\s?\d+? - (\w+)$/);
                if (str === 'name') {
                    beChanged[i] = 'Company';
                } else if (str === 'title') {
                    beChanged[i] = 'Job Title';
                } else if (str === 'department') {
                    beChanged[i] = 'Department';
                } else {
                    beRemoved[i] = true;
                }
                return acc;
            }
            /*
                consecutive headers for generic property with type are
                * property - type
                * property - value
                we have to erase the first header and change the second one accordingly
            */
            if (/(.*) - type$/i.test(header)) {
                const [, property] = header.match(/(.*) - type$/i);
                beRemoved[i] = true;
                beChanged[i + 1] = (capitalize(toVcardType(value)) + ' ' + property).trim();
                return acc;
            }

            return acc;
        },
        { beRemoved: Object.create(null), beChanged: Object.create(null) }
    );

    const standardHeaders = headers
        .map((header, index) => (beChanged[index] ? beChanged[index] : header))
        .filter((_header, index) => !beRemoved[index]);

    const standardContacts = contacts.map((values) => values.filter((_value, j) => !beRemoved[j]));

    return { headers: standardHeaders, contacts: standardContacts };
};

/**
 * Given a csv property name (header), return a function that transforms
 * a value for that property into one or several pre-vCard properties
 * @param {String} CsvProperty
 *
 * @return {Function}
 */
export const toPreVcard = (header) => {
    const property = header.toLowerCase();
    if (['title', 'name prefix'].includes(property)) {
        return (value) => [templates['fn']({ header, value, index: 0 }), templates['n']({ header, value, index: 3 })];
    }
    if (['first name', 'given name'].includes(property)) {
        return (value) => [templates['fn']({ header, value, index: 1 }), templates['n']({ header, value, index: 1 })];
    }
    if (['middle name', 'additional name'].includes(property)) {
        return (value) => [templates['fn']({ header, value, index: 2 }), templates['n']({ header, value, index: 2 })];
    }
    if (['last name', 'family name'].includes(property)) {
        return (value) => [templates['fn']({ header, value, index: 3 }), templates['n']({ header, value, index: 0 })];
    }
    if (['suffix', 'name suffix'].includes(property)) {
        return (value) => [templates['fn']({ header, value, index: 4 }), templates['n']({ header, value, index: 4 })];
    }
    if (['given yomi', 'given name yomi'].includes(property)) {
        return (value) => templates['fnYomi']({ header, value, index: 0 });
    }
    if (['middle name yomi', 'additional name yomi'].includes(property)) {
        return (value) => templates['fnYomi']({ header, value, index: 1 });
    }
    if (['surname yomi', 'family name yomi'].includes(property)) {
        return (value) => templates['fnYomi']({ header, value, index: 2 });
    }
    if (/^company\s?(\d*)/.test(property)) {
        const [, pref] = property.match(/^company\s?(\d*)/);
        return (value) => templates['org']({ pref, header, value, index: 0 });
    }
    if (/^department\s?(\d*)/.test(property)) {
        const [, pref] = property.match(/^department\s?(\d*)/);
        return (value) => templates['org']({ pref, header, value, index: 1 });
    }
    if (/^(\w+)?\s?e-mail\s?(\d*)/.test(property)) {
        const [, type, pref] = property.match(/^(\w+)?\s?e-mail\s?(\d*)/);
        return (value) => templates['email']({ pref, header, value, type: type ? toVcardType(type) : '' });
    }
    if (/^(\w+\s*\w+)?\s?phone\s?(\d*)$/.test(property)) {
        const [, type, pref] = property.match(/^(\w+\s*\w+)?\s?phone\s?(\d*)$/);
        return (value) => templates['tel']({ pref, header, value, type: type ? toVcardType(type) : '' });
    }
    if (/^(\w+)?\s?fax\s?(\d*)$/.test(property)) {
        const [, , pref] = property.match(/^(\w+)?\s?fax\s?(\d*)$/);
        return (value) => templates['tel']({ pref, header, value, type: 'fax' });
    }
    if (/^(\w+)?\s?pager\s?(\d*)$/.test(property)) {
        const [, , pref] = property.match(/^(\w+)?\s?pager\s?(\d*)$/);
        return (value) => templates['tel']({ pref, header, value, type: 'pager' });
    }
    if (/^[callback,telex]\s?(\d*)$/.test(property)) {
        const [, pref] = property.match(/^[pager,callback,telex]\s?(\d*)$/);
        return (value) => templates['tel']({ pref, header, value, type: 'other' });
    }
    if (/^(\w+) po box\s?(\d*)$/.test(property)) {
        const [, type, pref] = property.match(/^(\w+) po box\s?(\d*)$/);
        return (value) => templates['adr']({ pref, header, type: toVcardType(type), value, index: 0 });
    }
    if (/^(\w+) extended address\s?(\d*)$/.test(property)) {
        const [, type, pref] = property.match(/^(\w+) street\s?(\d*)$/);
        return (value) => templates['adr']({ pref, header, type: toVcardType(type), value, index: 1 });
    }
    if (/^(\w+) street\s?(\d*)$/.test(property)) {
        const [, type, pref] = property.match(/^(\w+) street\s?(\d*)$/);
        return (value) => templates['adr']({ pref, header, type: toVcardType(type), value, index: 2 });
    }
    if (/^(\w+) city\s?(\d*)$/.test(property)) {
        const [, type, pref] = property.match(/^(\w+) city\s?(\d*)$/);
        return (value) => templates['adr']({ pref, header, type: toVcardType(type), value, index: 3 });
    }
    if (/^(\w+) state\s?(\d*)$/.test(property)) {
        const [, type, pref] = property.match(/^(\w+) state\s?(\d*)$/);
        return (value) => templates['adr']({ pref, header, type: toVcardType(type), value, index: 4 });
    }
    if (/^(\w+) postal code\s?(\d*)$/.test(property)) {
        const [, type, pref] = property.match(/^(\w+) postal code\s?(\d*)$/);
        return (value) => templates['adr']({ pref, header, type: toVcardType(type), value, index: 5 });
    }
    if (/^(\w+) country\/region\s?(\d*)$/.test(property)) {
        const [, type, pref] = property.match(/^(\w+) country\/region\s?(\d*)$/);
        return (value) => templates['adr']({ pref, header, type: toVcardType(type), value, index: 6 });
    }
    if (property === 'nickname') {
        return (value) => ({
            header,
            value: [value],
            checked: true,
            field: 'nickname'
        });
    }
    if (property === 'imaddress') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'impp'
        });
    }
    if (property === 'job title') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'title'
        });
    }
    if (property.includes('relation')) {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'related'
        });
    }
    if (property === "manager's name") {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'related',
            type: 'co-worker'
        });
    }
    if (property === "assistant's name") {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'related',
            type: 'agent'
        });
    }
    if (property === 'spouse') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'related',
            type: 'spouse'
        });
    }
    if (property === 'birthday') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'bday'
        });
    }
    if (property === 'anniversary') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'anniversary'
        });
    }
    if (property === 'personal web page' || property.includes('website')) {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'url'
        });
    }
    if (property === 'location') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'geo',
            type: 'main'
        });
    }
    if (property === 'office location') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'geo',
            type: 'work'
        });
    }
    if (property === 'notes' || property.includes('custom field')) {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'note'
        });
    }

    // convert any other property into custom note
    return (value) => ({
        header,
        value,
        checked: true,
        field: 'note',
        custom: true
    });
};

/**
 * When there is only one pre-vCard property in a pre-vCards property, get the property
 * @param {Array} preVcards     A pre-vCards property
 *
 * @return {String}             Value of the pre-vCards property
 */
const getFirstValue = (preVcards) => (preVcards[0].checked ? preVcards[0].value : '');

const templates = {
    fn({ header, value, index }) {
        return {
            header,
            value,
            checked: true,
            pref: 1,
            field: 'fn',
            type: 'main',
            combineInto: 'fn-main',
            combineIndex: index
        };
    },
    fnYomi({ header, value, index }) {
        return {
            header,
            value,
            checked: true,
            pref: 2,
            field: 'fn',
            type: 'yomi',
            combineInto: 'fn-yomi',
            combineIndex: index
        };
    },
    n({ header, value, index }) {
        return { header, value, checked: true, field: 'n', combineInto: 'n', combineIndex: index };
    },
    email({ pref, header, value, type }) {
        return {
            pref,
            header,
            value,
            checked: true,
            field: 'email',
            type,
            group: pref
        };
    },
    tel({ pref, header, value, type }) {
        return {
            pref,
            header,
            value,
            checked: true,
            field: 'tel',
            type
        };
    },
    adr({ pref, header, type, value, index }) {
        return {
            pref,
            header,
            value,
            checked: true,
            field: 'adr',
            type,
            combineInto: `adr-${type}`,
            combineIndex: index
        };
    },
    org({ pref, header, value, index }) {
        return {
            pref,
            header,
            value,
            checked: true,
            field: 'org',
            combineInto: 'org',
            combineIndex: index
        };
    }
};

/**
 * This object contains the functions that must be used when combining pre-vCard properties into
 * vCard ones. The keys correspond to the field of the pre-vCards to be combined.
 */
export const combine = {
    fn(preVcards) {
        return preVcards.reduce((acc, { value, checked }) => (value && checked ? acc + ` ${value}` : acc), '').trim();
    },
    n(preVcards) {
        const propertyN = new Array(5).fill('');
        preVcards.forEach(({ value, checked, combineIndex }) => {
            if (checked) {
                propertyN[combineIndex] = value;
            }
        });
        return propertyN;
    },
    adr(preVcards) {
        const propertyADR = new Array(7).fill('');
        preVcards.forEach(({ value, checked, combineIndex }) => {
            if (checked) {
                propertyADR[combineIndex] = value;
            }
        });
        return propertyADR;
    },
    org(preVcards) {
        const propertyORG = new Array(2).fill('');
        preVcards.forEach(({ value, checked, combineIndex }) => {
            if (checked) {
                propertyORG[combineIndex] = value;
            }
        });
        return propertyORG.filter(Boolean).join(';');
    },
    email: getFirstValue,
    tel: getFirstValue,
    nickname: getFirstValue,
    photo: getFirstValue,
    bday: getFirstValue,
    anniversary: getFirstValue,
    title: getFirstValue,
    role: getFirstValue,
    note: getFirstValue,
    url: getFirstValue,
    gender: getFirstValue,
    lang: getFirstValue,
    tz: getFirstValue,
    geo: getFirstValue,
    logo: getFirstValue,
    member: getFirstValue,
    impp: getFirstValue,
    related: getFirstValue,
    categories: getFirstValue,
    sound: getFirstValue,
    custom(preVcards) {
        const { header, value } = preVcards[0];
        return value ? `${header}: ${getFirstValue(preVcards)}` : '';
    }
};

/**
 * Because the value of a vCard property is not always a string (sometimes it is an array),
 * we need an additional function that combines the csv properties into a string to be displayed.
 * This object contains the functions that take an array of pre-vCards properties to be combined
 * and returns the value to be displayed. The keys correspond to the field of the pre-vCards to be combined.
 */
export const display = {
    fn(preVcards) {
        return preVcards.reduce((acc, { value, checked }) => (value && checked ? acc + ` ${value}` : acc), '').trim();
    },
    n(preVcards) {
        const propertyN = new Array(5).fill('');
        preVcards.forEach(({ value, checked, combineIndex }) => {
            if (checked) {
                propertyN[combineIndex] = value;
            }
        });
        return propertyN.filter(Boolean).join(', ');
    },
    adr(preVcards) {
        const propertyADR = new Array(7).fill('');
        preVcards.forEach(({ value, checked, combineIndex }) => {
            if (checked) {
                propertyADR[combineIndex] = value;
            }
        });
        return propertyADR.filter(Boolean).join(', ');
    },
    org(preVcards) {
        const propertyORG = new Array(2).fill('');
        preVcards.forEach(({ value, checked, combineIndex }) => {
            if (checked) {
                propertyORG[combineIndex] = value;
            }
        });
        return propertyORG.filter(Boolean).join('; ');
    },
    nickname(preVcards) {
        return getFirstValue(preVcards)[0];
    },
    email: getFirstValue,
    tel: getFirstValue,
    photo: getFirstValue,
    bday: getFirstValue,
    anniversary: getFirstValue,
    title: getFirstValue,
    role: getFirstValue,
    note: getFirstValue,
    url: getFirstValue,
    gender: getFirstValue,
    lang: getFirstValue,
    tz: getFirstValue,
    geo: getFirstValue,
    logo: getFirstValue,
    member: getFirstValue,
    impp: getFirstValue,
    related: getFirstValue,
    categories: getFirstValue,
    sound: getFirstValue,
    custom(preVcards) {
        const { header, value, checked } = preVcards[0];
        return checked && value ? `${header}: ${getFirstValue(preVcards)}` : '';
    }
};

/**
 * Standarize a custom vcard type coming from a csv property
 * @param {String} csvType
 *
 * @return {String}
 */
const toVcardType = (csvType) => {
    const type = csvType.toLowerCase();

    switch (type) {
        case 'home':
            return 'home';
        case 'business':
            return 'work';
        case 'work':
            return 'work';
        case 'mobile':
            return 'cell';
        case 'cell':
            return 'cell';
        case 'other':
            return 'other';
        case 'main':
            return 'main';
        case 'primary':
            return 'main';
        case 'company main':
            return 'work';
        case 'pager':
            return 'pager';
        case 'home fax':
            return 'fax';
        case 'work fax':
            return 'fax';
        default:
            return '';
    }
};
