/**
 * Make sure we keep only valid properties
 * @param {Array} properties
 * @returns {Array}
 */
export const sanitizeProperties = (properties = []) => {
    // properties should be either arrays or strings. Transform to string otherwise.
    // usually the case of a date for bday or anniversary fields
    return properties
        .filter(({ value }) => value)
        .map((property) =>
            Array.isArray(property.value) ? property : { ...property, value: property.value.toString() }
        );
};

/**
 * Add `pref` to email, adr, tel to save order
 * @param {Array} properties
 * @param {Array}
 */
export const addPref = (properties = []) => {
    const prefs = { email: 0, tel: 0, adr: 0 };
    return properties.map((property) => {
        if (!['email', 'adr', 'tel'].includes(property.field)) {
            return property;
        }

        const pref = (prefs[property.field] = prefs[property.field] + 1);

        return {
            ...property,
            pref
        };
    });
};

/**
 * Function that sorts properties by preference
 */
export const sortByPref = (firstEl, secondEl) => firstEl.pref <= secondEl.pref;

/**
 * Generate new group name that doesn't exist
 * @param {Array<String>} existingGroups
 * @returns {String}
 */
export const generateNewGroupName = (existingGroups = []) => {
    let index = 1;
    let found = false;

    while (!found) {
        if (existingGroups.includes(`item${index}`)) {
            index++;
        } else {
            found = true;
        }
    }

    return `item${index}`;
};

/**
 * Add `group` if missing for email
 * @param {Array} properties
 * @returns {Array}
 */
export const addGroup = (properties = []) => {
    const existingGroups = properties.map(({ group }) => group);
    return properties.map((property) => {
        if (!['email'].includes(property.field) || property.group) {
            return property;
        }

        const group = generateNewGroupName(existingGroups);
        existingGroups.push(group);

        return {
            ...property,
            group
        };
    });
};
