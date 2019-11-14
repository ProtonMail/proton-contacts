import { getPublicKeys } from 'proton-shared/lib/api/keys';

import { API_CUSTOM_ERROR_CODES } from 'proton-shared/lib/errors';
import { RECIPIENT_TYPE } from 'proton-shared/lib/constants';

const { KEY_GET_ADDRESS_MISSING, KEY_GET_DOMAIN_MISSING_MX, KEY_GET_INPUT_INVALID } = API_CUSTOM_ERROR_CODES;
const { TYPE_NO_RECEIVE } = RECIPIENT_TYPE;

const EMAIL_ERRORS = [KEY_GET_ADDRESS_MISSING, KEY_GET_DOMAIN_MISSING_MX, KEY_GET_INPUT_INVALID];

/**
 * Get the keys for an email address from the API.
 * @param {String} Email
 * @returns {Promise<{RecipientType, MIMEType, Keys}>}
 */
export const getKeysFromApi = async (Email, api) => {
    try {
        // eslint-disable-next-line no-unused-vars
        const { Code, ...data } = await api(getPublicKeys({ Email }));
        return data;
    } catch (error) {
        const { data = {} } = error;

        if (EMAIL_ERRORS.includes(data.Code)) {
            return {
                RecipientType: TYPE_NO_RECEIVE,
                MIMEType: null,
                Keys: []
            };
        }

        throw error;
    }
};
