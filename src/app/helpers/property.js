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

export const getValues = (contact = {}, fields = []) => {
    return fields.reduce((acc, field) => {
        const properties = contact[field] || [];

        if (properties.length) {
            properties.forEach((property) => {
                acc.push(...property.values);
            });
        }

        return acc;
    }, []);
};

export const getFirstValues = (contact, field) => {
    const [{ values = [] } = {}] = contact[field] || [];
    return values;
};