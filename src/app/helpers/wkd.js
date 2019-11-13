import { getPublicKeys } from 'proton-shared/lib/api/keys';
import { addGroup } from './properties';

import { RECIPIENT_TYPE } from 'proton-shared/lib/constants';

const { TYPE_EXTERNAL } = RECIPIENT_TYPE;

/**
 * Check if an email address has WKD keys
 * @param {String} email
 * @param {Function} api
 *
 * @return {Boolean}
 */
export const hasWKDKeys = async (email, api) => {
    const { RecipientType, Keys = [] } = await api(getPublicKeys({ Email: email }));
    return RecipientType === TYPE_EXTERNAL && !!Keys.length;
};

/**
 * For a contact given as a list of properties, check if the email properties contain the 'checkForWKDKeys'.
 * If so, check if there are WKD keys and add the corresponding flags if needed
 * @param {Array<Object>} properties
 * @param {Function} api
 *
 * @return {Array<Object>}      Contact with WKD flags
 */
export const addWKDFlags = async (properties, api) => {
    const propertiesWithWKDFlags = [];
    const withGroup = addGroup(properties);
    for (const property of withGroup) {
        if (property.field !== 'email') {
            propertiesWithWKDFlags.push(property);
        } else if (property.checkForWKDKeys && (await hasWKDKeys(property.value, api))) {
            propertiesWithWKDFlags.push(
                property,
                { field: 'x-pm-encrypt', value: 'true', group: property.group },
                { field: 'x-pm-sign', value: 'true', group: property.group }
            );
        } else {
            propertiesWithWKDFlags.push(property);
        }
    }
    return propertiesWithWKDFlags;
};
