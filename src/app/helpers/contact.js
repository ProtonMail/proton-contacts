import { normalize } from 'proton-shared/lib/helpers/string';

export const getEmails = ({ Emails = [] }) => Emails.map((email) => normalize(email)).filter(Boolean);

export const getName = ({ Name }) => normalize(Name);

/**
 * Generates a contact UID of the form 'proton-web-uuid'
 * @return {String}
 */
export const generateUID = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };

    return `proton-web-${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};
