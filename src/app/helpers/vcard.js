import ICAL from 'ical.js';

const ONE_ORE_MORE_MUST_BE_PRESENT = '1*';
const EXACTLY_ONE_MUST_BE_PRESENT = '1';
const EXACTLY_ONE_MAY_BE_PRESENT = '*1';
const ONE_OR_MORE_MAY_BE_PRESENT = '*';

const PROPERTIES = {
    fn: { cardinality: ONE_ORE_MORE_MUST_BE_PRESENT },
    n: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT },
    nickname: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    photo: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    bday: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT },
    anniversary: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT },
    gender: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT },
    adr: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    tel: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    email: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    impp: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    lang: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    tz: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    geo: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    title: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    role: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    logo: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    org: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    member: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    related: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    categories: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    note: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    prodid: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT },
    rev: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT },
    sound: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    uid: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT },
    clientpidmap: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    url: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    version: { cardinality: EXACTLY_ONE_MUST_BE_PRESENT },
    key: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    fburl: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    caladruri: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT },
    caluri: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT }
};

export const getAllProperties = () => Object.keys(PROPERTIES);
export const isCustomField = (field = '') => field.startsWith('x-');

export const parse = (vcard = '') => {
    const comp = new ICAL.Component(ICAL.parse(vcard));
    const properties = comp.getAllProperties();

    return properties.reduce((acc, property) => {
        const type = property.getParameter('type');
        const splitted = property.name.split('.');
        const field = splitted[1] ? splitted[1] : splitted[0];

        // Ignore invalid field
        if (!field) {
            return acc;
        }

        const isCustom = isCustomField(field);

        // Ignore invalid property
        if (!isCustom && !PROPERTIES[field]) {
            return acc;
        }

        const group = splitted[1] ? splitted[0] : undefined;
        const value = { group, type, values: property.getValues() };
        const { cardinality = ONE_OR_MORE_MAY_BE_PRESENT } = PROPERTIES[field] || {};

        if ([ONE_ORE_MORE_MUST_BE_PRESENT, ONE_OR_MORE_MAY_BE_PRESENT].includes(cardinality)) {
            acc[field] = acc[field] || [];
            acc[field].push(value);
        } else {
            acc[field] = value;
        }

        return acc;
    }, {});
};

export const toICAL = (contact = {}) => {
    return Object.entries(contact).reduce((acc, [field, { type, values, group }]) => {
        const fieldWithGroup = [group, field].filter(Boolean).join('.');
        const property = new ICAL.Property(fieldWithGroup, acc);
        property.setValues(values);
        property.setParameter('type', type);
        acc.addProperty(property);
        return acc;
    }, new ICAL.Component());
};

export const merge = (vcards = []) => {
    return vcards.reduce((acc, vcard) => {
        Object.entries(vcard).forEach(([field, value]) => {
            const { cardinality = ONE_OR_MORE_MAY_BE_PRESENT } = PROPERTIES[field] || {};

            if ([ONE_ORE_MORE_MUST_BE_PRESENT, ONE_OR_MORE_MAY_BE_PRESENT].includes(cardinality)) {
                acc[field] = acc[field] || [];
                acc[field].push(...value);
            } else if (!acc[field]) {
                acc[field] = value;
            }
        });
        return acc;
    }, {});
};

export const displayAdr = (adr = '') => {
    return adr
        .split(',')
        .filter(Boolean)
        .join('\n');
};

export const clearType = (type = '') => type.toLowerCase().replace('x-', '');

export const getType = (types = []) => {
    if (Array.isArray(types)) {
        if (!types.length) {
            return '';
        }
        return types[0];
    }
    return types;
};

export const getValue = (values = []) => values.join(', ');
