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

export const getAllFields = () => Object.keys(PROPERTIES);
export const isCustomField = (field = '') => field.startsWith('x-');

export const getValue = (property) => {
    const values = property.getValues().map((val) => {
        if (typeof val === 'string') {
            return val;
        }

        return val.toString();
    });
    return property.isMultiValue ? values : values[0];
};

/**
 * Parse vCard String an return contact properties model as an Array
 * @param {String} vcard to parse
 * @returns {Array} contact properties
 */
export const parse = (vcard = '') => {
    const comp = new ICAL.Component(ICAL.parse(vcard));
    const properties = comp.getAllProperties();

    return properties.reduce((acc, property) => {
        const type = property.getParameter('type');
        const pref = property.getParameter('pref');
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
        const prop = { pref, field, group, type, value: getValue(property) };

        acc.push(prop);

        return acc;
    }, []);
};

/**
 * Parse contact properties to create a ICAL vcard component
 * @param {Array} contact properties
 * @returns {ICAL.Component} vcard
 */
export const toICAL = (properties = []) => {
    const comp = new ICAL.Component('vcard');
    const versionProperty = new ICAL.Property('version');
    versionProperty.setValue('4.0');
    comp.addProperty(versionProperty);
    return properties.reduce((component, { field, type, value, group }) => {
        const fieldWithGroup = [group, field].filter(Boolean).join('.');
        const property = new ICAL.Property(fieldWithGroup);
        property.isMultiValue ? property.setValues(value) : property.setValue(value);
        type && property.setParameter('type', type);
        component.addProperty(property);
        return component;
    }, comp);
};

/**
 * Merge multiple contact properties
 * order matters
 * @param {Array} contacts
 * @returns {Array} contact properties
 */
export const merge = (contacts = []) => {
    return contacts.reduce((acc, properties) => {
        properties.forEach((property) => {
            const { field } = property;
            const { cardinality = ONE_OR_MORE_MAY_BE_PRESENT } = PROPERTIES[field] || {};

            if ([ONE_ORE_MORE_MUST_BE_PRESENT, ONE_OR_MORE_MAY_BE_PRESENT].includes(cardinality)) {
                acc.push(property);
            } else if (!acc.find(({ field: f }) => f === field)) {
                acc.push(property);
            }
        });
        return acc;
    }, []);
};

export const orderProperties = (properties) => {
    return properties;
};
