import ICAL from 'ical.js';

const ONE_ORE_MORE_MUST_BE_PRESENT = '1*';
const EXACTLY_ONE_MUST_BE_PRESENT = '1';
const EXACTLY_ONE_MAY_BE_PRESENT = '*1';
const ONE_OR_MORE_MAY_BE_PRESENT = '*';

const PROPERTIES = {
    fn: { cardinality: ONE_ORE_MORE_MUST_BE_PRESENT, type: 'text' },
    n: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT, type: 'text' },
    nickname: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    photo: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    bday: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT, type: 'text' },
    anniversary: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT, type: 'text' },
    gender: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT, type: 'text' },
    adr: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    tel: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    email: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    impp: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    lang: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    tz: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    geo: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    title: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    role: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    logo: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    org: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    member: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    related: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    categories: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    note: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    prodid: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT, type: 'text' },
    rev: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT, type: 'text' },
    sound: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    uid: { cardinality: EXACTLY_ONE_MAY_BE_PRESENT, type: 'text' },
    clientpidmap: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    url: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    version: { cardinality: EXACTLY_ONE_MUST_BE_PRESENT, type: 'text' },
    key: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    fburl: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    caladruri: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' },
    caluri: { cardinality: ONE_OR_MORE_MAY_BE_PRESENT, type: 'text' }
};

export const getAllProperties = () => Object.keys(PROPERTIES);
export const isCustomField = (field = '') => field.startsWith('x-');

export const parse = (vcard = '') => {
    const comp = new ICAL.Component(ICAL.parse(vcard));
    const properties = comp.getAllProperties();

    return properties.reduce((acc, property) => {
        const { type = 'text' } = property;
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
        const property = new ICAL.Property([[group, field].filter(Boolean).join('.'), {}, type, values], acc);
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
