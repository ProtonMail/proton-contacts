import ICAL from 'ical.js';
import { readFileAsString } from 'proton-shared/lib/helpers/file';
import { hasPref, sortByPref } from './properties';
import { getValue } from './property';

export const ONE_OR_MORE_MUST_BE_PRESENT = '1*';
export const EXACTLY_ONE_MUST_BE_PRESENT = '1';
export const EXACTLY_ONE_MAY_BE_PRESENT = '*1';
export const ONE_OR_MORE_MAY_BE_PRESENT = '*';

export const PROPERTIES = {
    fn: { cardinality: ONE_OR_MORE_MUST_BE_PRESENT },
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

export const isCustomField = (field = '') => field.startsWith('x-');

/**
 * Parse vCard String and return contact properties model as an Array
 * @param {String} vcard to parse
 * @returns {Array} contact properties ordered
 */
export const parse = (vcard = '') => {
    const comp = new ICAL.Component(ICAL.parse(vcard));
    const properties = comp.getAllProperties();

    return properties
        .reduce((acc, property) => {
            const splitProperty = property.name.split('.');
            const field = splitProperty[1] ? splitProperty[1] : splitProperty[0];
            const type = property.getParameter('type');
            const prefValue = property.getParameter('pref');
            const pref = typeof prefValue === 'string' && hasPref(field) ? +prefValue : undefined;

            // Ignore invalid field
            if (!field) {
                return acc;
            }

            const isCustom = isCustomField(field);

            // Ignore invalid property
            if (!isCustom && !PROPERTIES[field]) {
                return acc;
            }

            const group = splitProperty[1] ? splitProperty[0] : undefined;
            const prop = { pref, field, group, type, value: getValue(property) };

            acc.push(prop);

            return acc;
        }, [])
        .sort(sortByPref);
};

/**
 * Parse contact properties to create a ICAL vcard component
 * @param {Array} contact properties
 * @returns {ICAL.Component} vcard
 */
export const toICAL = (properties = []) => {
    // make sure version (we enforce 4.0) is the first property; otherwise invalid vcards can be generated
    const versionLessProperties = properties.filter(({ field }) => field !== 'version');

    const comp = new ICAL.Component('vcard');
    const versionProperty = new ICAL.Property('version');
    versionProperty.setValue('4.0');
    comp.addProperty(versionProperty);

    return versionLessProperties.reduce((component, { field, type, pref, value, group }) => {
        const fieldWithGroup = [group, field].filter(Boolean).join('.');
        const property = new ICAL.Property(fieldWithGroup);
        property.setValue(value);
        type && property.setParameter('type', type);
        pref && property.setParameter('pref', '' + pref);
        component.addProperty(property);
        return component;
    }, comp);
};

/**
 * Merge multiple contact properties
 * order matters
 * @param {Array} contact
 * @returns {Array} contact properties
 */
export const merge = (contact = []) => {
    return contact.reduce((acc, properties) => {
        properties.forEach((property) => {
            const { field } = property;
            const { cardinality = ONE_OR_MORE_MAY_BE_PRESENT } = PROPERTIES[field] || {};

            if ([ONE_OR_MORE_MUST_BE_PRESENT, ONE_OR_MORE_MAY_BE_PRESENT].includes(cardinality)) {
                acc.push(property);
            } else if (!acc.find(({ field: f }) => f === field)) {
                acc.push(property);
            }
        });
        return acc;
    }, []);
};

/**
 * Basic test for the validity of a vCard file read as a string
 * @param {String} vcf
 *
 * @return {Boolean}
 */
const isValid = (vcf = '') =>
    !!vcf.match(/BEGIN:VCARD/g) && vcf.match(/BEGIN:VCARD/g).length === (vcf.match(/END:VCARD/g) || []).length;

/**
 * Read a vCard file as a string. If there are errors when parsing the csv, throw
 * @param {File} vcf
 *
 * @return {String}
 */
export const readVcf = async (file) => {
    const vcf = await readFileAsString(file);
    if (!isValid(vcf)) {
        throw new Error('Error when reading vcf file');
    }
    return vcf;
};

/**
 * Extract array of vcards from a string containing several vcards
 * @param {String} vcf
 *
 * @return {Array<String>}  Array of vcards
 */
export const extractVcards = (vcf = '') => {
    const vcards = vcf.split('END:VCARD');
    vcards.pop();
    return vcards.map((vcard) => vcard.trim() + '\r\nEND:VCARD');
};
