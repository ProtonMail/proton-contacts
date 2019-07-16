/**
 * Given a csv property name (header), return a function that transforms
 * a value for that property into one or several pre-vCard properties
 * @param {String} CsvProperty
 *
 * @return {Function}
 */
export const toPreVcard = (header) => {
    const property = header.toLowerCase();
    if (property === 'prefix' || property === 'title') {
        return (value) => [templates['fn']({ header, value, index: 0 }), templates['n']({ header, value, index: 3 })];
    }
    if (property === 'first name') {
        return (value) => [templates['fn']({ header, value, index: 1 }), templates['n']({ header, value, index: 1 })];
    }
    if (property === 'middle name') {
        return (value) => [templates['fn']({ header, value, index: 2 }), templates['n']({ header, value, index: 2 })];
    }
    if (property === 'last name') {
        return (value) => [templates['fn']({ header, value, index: 3 }), templates['n']({ header, value, index: 0 })];
    }
    if (property === 'suffix') {
        return (value) => [templates['fn']({ header, value, index: 4 }), templates['n']({ header, value, index: 4 })];
    }
    if (property === 'given yomi') {
        return (value) => templates['fnYomi']({ header, value, index: 0 });
    }
    if (property === 'surname yomi') {
        return (value) => templates['fnYomi']({ header, value, index: 1 });
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
    if (/^(\w+) street$/.test(property)) {
        const match = property.match(/^(\w+) street/);
        return (value) => templates['adr']({ header, type: toVcardType(match[1]), value, index: 2 });
    }
    if (/^(\w+) city$/.test(property)) {
        const match = property.match(/^(\w+) city/);
        return (value) => templates['adr']({ header, type: toVcardType(match[1]), value, index: 3 });
    }
    if (/^(\w+) state$/.test(property)) {
        const match = property.match(/^(\w+) state/);
        return (value) => templates['adr']({ header, type: toVcardType(match[1]), value, index: 4 });
    }
    if (/^(\w+) postal code$/.test(property)) {
        const match = property.match(/^(\w+) postal code/);
        return (value) => templates['adr']({ header, type: toVcardType(match[1]), value, index: 5 });
    }
    if (/^(\w+) country/.test(property)) {
        const match = property.match(/^(\w+) country/);
        return (value) => templates['adr']({ header, type: toVcardType(match[1]), value, index: 6 });
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
    if (property === 'personal web page') {
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
    return (value) => null;
    // Brute-force all of them ?
};

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
    email({ pref, header, value }) {
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
    adr({ header, type, value, index }) {
        return {
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
    }
};

const toVcardType = (csvType) => {
    switch (csvType) {
        case 'home':
            return 'home';
        case 'business':
            return 'work';
        case 'mobile':
            return 'cell';
        case 'other':
            return 'other';
        case 'primary':
            return 'main';
        case 'company main':
            return 'work, main';
    }
};
