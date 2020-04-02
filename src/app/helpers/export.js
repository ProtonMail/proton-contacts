import { toICAL } from 'proton-shared/lib/contacts/vcard';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';

/**
 * Export a single contact, given as an array of properties
 * @param {Array} properties
 */
export const singleExport = (properties) => {
    const filename = properties
        .filter(({ field }) => ['fn', 'email'].includes(field))
        .map(({ value }) => (Array.isArray(value) ? value[0] : value))[0];
    const vcard = toICAL(properties);
    const blob = new Blob([vcard.toString()], { type: 'data:text/plain;charset=utf-8;' });

    downloadFile(blob, `${filename}.vcf`);
};
