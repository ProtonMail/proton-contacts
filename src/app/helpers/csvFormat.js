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
    if (/^(\w+) fax\s?(\d*)$/.test(property)) {
        const match = property.match(/^(\w+) fax\s?(\d*)$/);
        return (value) =>
            templates['tel']({ pref: +match[2] || 1, header, value, type: `fax, ${toVcardType(match[1])}` });
    }
    if (/^[pager,callback,telex]\s?(\d*)$/.test(property)) {
        const match = property.match(/^[pager,callback,telex]\s?(\d*)$/);
        return (value) =>
            templates['tel']({ pref: +match[2] || 1, header, value, type: `other, ${toVcardType(match[1])}` });
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
            field: 'nickname',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'imaddress') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'impp',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'job title') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'title',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'job title') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'title',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === "manager's name") {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'related',
            type: 'co-worker',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === "assistant's name") {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'related',
            type: 'agent',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'spouse') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'related',
            type: 'spouse',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'birthday') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'bday',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'anniversary') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'anniversary',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'personal web page' || property.includes('website')) {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'url',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'location') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'geo',
            type: 'main',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'office location') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'geo',
            type: 'work',
            combine: getFirstValue,
            display: getFirstValue
        });
    }
    if (property === 'notes') {
        return (value) => ({
            header,
            value,
            checked: true,
            field: 'note',
            combine: getFirstValue,
            display: getFirstValue
        });
    }

    return (value) => ({
        header,
        value,
        checked: true,
        field: 'note',
        combine(preVcards) {
            return value ? `${header}: ${getFirstValue(preVcards)}` : '';
        },
        display(preVcards) {
            return value ? `${header}: ${getFirstValue(preVcards)}` : '';
        }
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
            combineIndex: index,
            combine(preVcards) {
                return preVcards
                    .reduce((acc, { value, checked }) => (value && checked ? acc + ` ${value}` : acc), '')
                    .trim();
            },
            display(preVcards) {
                return preVcards
                    .reduce((acc, { value, checked }) => (value && checked ? acc + ` ${value}` : acc), '')
                    .trim();
            }
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
            combineIndex: index,
            combine(preVcards) {
                return preVcards
                    .reduce((acc, { value, checked }) => (value && checked ? acc + ` ${value}` : acc), '')
                    .trim();
            },
            display(preVcards) {
                return preVcards
                    .reduce((acc, { value, checked }) => (value && checked ? acc + ` ${value}` : acc), '')
                    .trim();
            }
        };
    },
    n({ header, value, index }) {
        return {
            header,
            value,
            checked: true,
            field: 'n',
            combineInto: 'n',
            combineIndex: index,
            combine(preVcards) {
                const propertyN = new Array(5).fill('');
                preVcards.forEach(({ value, checked, combineIndex }) => {
                    if (checked) {
                        propertyN[combineIndex] = value;
                    }
                });
                return propertyN;
            },
            display(preVcards) {
                const propertyN = new Array(5).fill('');
                preVcards.forEach(({ value, checked, combineIndex }) => {
                    if (checked) {
                        propertyN[combineIndex] = value;
                    }
                });
                return propertyN.filter(Boolean).join(', ');
            }
        };
    },
    email({ pref, header, value, type }) {
        return {
            pref,
            header,
            value,
            checked: true,
            field: 'email',
            type: 'home',
            group: pref,
            combine: getFirstValue,
            display: getFirstValue
        };
    },
    tel({ pref, header, value, type }) {
        return {
            pref,
            header,
            value,
            checked: true,
            field: 'tel',
            type,
            combine: getFirstValue,
            display: getFirstValue
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
            combineIndex: index,
            combine(preVcards) {
                const propertyADR = new Array(6).fill('');
                preVcards.forEach(({ value, checked, combineIndex }) => {
                    if (checked) {
                        propertyADR[combineIndex] = value;
                    }
                });
                return propertyADR;
            },
            display(preVcards) {
                const propertyADR = new Array(6).fill('');
                preVcards.forEach(({ value, checked, combineIndex }) => {
                    if (checked) {
                        propertyADR[combineIndex] = value;
                    }
                });
                return propertyADR.filter(Boolean).join(', ');
            }
        };
    },
    org({ header, value, index }) {
        return {
            header,
            value,
            checked: true,
            field: 'org',
            combineInto: 'org',
            combineIndex: index,
            combine(preVcards) {
                const propertyORG = new Array(2).fill('');
                preVcards.forEach(({ value, checked, combineIndex }) => {
                    if (checked) {
                        propertyORG[combineIndex] = value;
                    }
                });
                return propertyORG.filter(Boolean).join(';');
            },
            display(preVcards) {
                const propertyORG = new Array(2).fill('');
                preVcards.forEach(({ value, checked, combineIndex }) => {
                    if (checked) {
                        propertyORG[combineIndex] = value;
                    }
                });
                return propertyORG.filter(Boolean).join('; ');
            }
        };
    }
};

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
        default:
            return 'other';
    }
};
