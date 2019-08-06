import ICAL from 'ical.js';
import { readFileAsString } from 'proton-shared/lib/helpers/file';

const ONE_OR_MORE_MUST_BE_PRESENT = '1*';
const EXACTLY_ONE_MUST_BE_PRESENT = '1';
const EXACTLY_ONE_MAY_BE_PRESENT = '*1';
const ONE_OR_MORE_MAY_BE_PRESENT = '*';

const PROPERTIES = {
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

export const getAllFields = () => Object.keys(PROPERTIES);
export const isCustomField = (field = '') => field.startsWith('x-');

/**
 * ICAL library can crash if the value saved in the vCard is improperly formatted
 * If it crash we get the raw value from jCal key
 * @param {ICAL.Property} property
 * @returns {Array<String>}
 */
const getRawValues = (property) => {
    try {
        return property.getValues();
    } catch (error) {
        const [, , , value = ''] = property.jCal || [];
        return [value];
    }
};

export const getValue = (property) => {
    const [value] = getRawValues(property).map((val) => {
        // adr
        if (Array.isArray(val)) {
            return val;
        }

        if (typeof val === 'string') {
            return val;
        }

        // date
        return val.toString();
    });

    return value;
};

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
            const type = property.getParameter('type');
            const prefValue = property.getParameter('pref');
            const pref = typeof prefValue === 'string' ? +prefValue : 1;
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
        }, [])
        .sort((firstEl, secondEl) => {
            // WARNING `sort` is mutating the new array returned by reduce
            return firstEl.pref <= secondEl.pref;
        });
};

/**
 * Parse contact properties to create a ICAL vcard component
 * @param {Array} contact properties
 * @returns {ICAL.Component} vcard
 */
export const toICAL = (properties = []) => {
    const comp = new ICAL.Component('vcard');
    if (!properties.some(({ field }) => field === 'version')) {
        const versionProperty = new ICAL.Property('version');
        versionProperty.setValue('4.0');
        comp.addProperty(versionProperty);
    }
    return properties.reduce((component, { field, type, value, group }) => {
        const fieldWithGroup = [group, field].filter(Boolean).join('.');
        const property = new ICAL.Property(fieldWithGroup);
        property.setValue(value);
        type && property.setParameter('type', type);
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
