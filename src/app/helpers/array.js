import { move } from 'proton-shared/lib/helpers/array';

/**
 * Re-order elements in an array inside a group of arrays
 * @param {Array<Array>} collection
 * @param {Number} groupIndex
 * @param {Object<Number>} indices     { oldIndex, newIndex }
 *
 * @return {Array<Array>}
 */
export const moveInGroup = (collection, groupIndex, { oldIndex, newIndex }) => {
    return collection.map((group, i) => {
        if (i === groupIndex) {
            return move(group, oldIndex, newIndex);
        }
        return group;
    });
};
