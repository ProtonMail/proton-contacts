// See './csv.js' for the definition of pre-vCard and pre-vCards contact

export const standarize = ({ headers, contacts }) => {
    return { headers, contacts };
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
    if (property === 'company') {
        return (value) => templates['org']({ header, value, index: 0 });
    }
    if (property === 'department') {
        return (value) => templates['org']({ header, value, index: 1 });
    }
    if (/^e-mail (\d*)/.test(property)) {
        const match = property.match(/^e-mail (\d+)/);
        return (value) => templates['email']({ pref: +(match && match[1]) || 1, header, value });
    }
    if (/^(\w+\s*\w*) phone\s?(\d*)$/.test(property)) {
        const match = property.match(/^(\w+\s*\w*) phone\s?(\d*)$/);
        return (value) => templates['tel']({ pref: +match[2] || 1, header, value, type: toVcardType(match[1]) });
    }
    if (/^(\w+)?\s?fax\s?(\d*)$/.test(property)) {
        const match = property.match(/^(\w+)?\s?fax\s?(\d*)$/);
        return (value) => templates['tel']({ pref: +match[2] || 1, header, value, type: 'fax' });
    }
    if (/^(\w+)?\s?pager\s?(\d*)$/.test(property)) {
        const match = property.match(/^(\w+)?\s?pager\s?(\d*)$/);
        return (value) => templates['tel']({ pref: +match[2] || 1, header, value, type: 'pager' });
    }
    if (/^[callback,telex]\s?(\d*)$/.test(property)) {
        const match = property.match(/^[pager,callback,telex]\s?(\d*)$/);
        return (value) => templates['tel']({ pref: +match[2] || 1, header, value, type: 'other' });
    }
    if (/^(\w+) street$/.test(property)) {
        const match = property.match(/^(\w+) street/);
        return (value) => templates['adr']({ header, type: toVcardType(match[1]), value, index: 2 });
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
            value,
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
    if (property === 'job title') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'title'
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
    if (property === 'notes') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'note'
        });
    }

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

/**
 * Combine pre-vCards properties into a single vCard one
 * @param {Array} preVcards     Array of pre-vCards properties
 *
 * @return {Object}             vCard property
 */
export const toVcard = (preVcards) => {
    if (!preVcards.length) {
        return {};
    }
    const { pref, field, type, combine, display } = preVcards[0];
    return { pref, field, type, value: combine(preVcards), display: display(preVcards) };
};

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
            type: 'home',
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
    org({ header, value, index }) {
        return {
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
        const propertyADR = new Array(6).fill('');
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
        const propertyADR = new Array(6).fill('');
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
        default:
            return 'other';
    }
};
