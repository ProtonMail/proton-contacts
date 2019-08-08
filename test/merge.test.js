import { linkConnections, extractMergeable, merge } from '../src/app/helpers/merge';

describe('merge', () => {
    describe('linkConnections', () => {
        it('should return same if no connections should be linked', async () => {
            const connections = [[1, 2], [3, 4]];
            expect(linkConnections(connections)).toEqual(connections);
        });
        it('should return same if there is only one connection', async () => {
            const connections = [[1, 2, 3, 4]];
            expect(linkConnections(connections)).toEqual(connections);
        });
        it('should return same if there are no connections', async () => {
            const connections = [];
            expect(linkConnections(connections)).toEqual(connections);
        });
        it('should work as expected for a few cases', async () => {
            const cases = [
                [[1, 8, 2], [9, 10, 5], [2, 4], [3, 5]],
                [[1, 8, 2], [9, 10, 5], [2, 4], [3, 5], [4, 9]],
                [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [1, 8], [7, 9]]
            ];
            const resultsSorted = cases.map((cs) => linkConnections(cs).map((c) => c.sort((a, b) => a - b)));
            const expectedSorted = [
                [[1, 2, 4, 8], [3, 5, 9, 10]],
                [[1, 2, 3, 4, 5, 8, 9, 10]],
                [[1, 2, 3, 4, 5, 6, 8], [7, 9]]
            ];
            expect(resultsSorted).toEqual(expectedSorted);
        });
    });

    describe('extractMergeable', () => {
        it('should capture together contacts with the same name', async () => {
            const alice1 = { Name: 'Alice', emails: ['alice@domain.com'] };
            const alice2 = { Name: 'alice', emails: ['ali@domain.com'] };
            const alice3 = { Name: 'Alice', emails: ['alias@domain.com'] };
            const alicia1 = { Name: 'Alicia', emails: ['alicia@domain.com'] };
            const bob1 = { Name: 'Bob', emails: ['wow@domain.com', 'batman@domain.com'] };
            const bob2 = { Name: 'bob', emails: ['bobby@domain.com'] };
            const carol1 = { Name: 'Carol', emails: ['carolinge@domain.com'] };

            const contacts = [alice1, alice2, alicia1, bob1, alice3, bob2, carol1];
            const mergeable = extractMergeable(contacts);

            expect(mergeable).toEqual([[alice1, alice2, alice3], [bob1, bob2]]);
        });
        it('should capture together contacts with the same email', async () => {
            const alice1 = { Name: 'Alice', emails: ['alice@domain.com'] };
            const alice2 = { Name: 'RkX02xqw7U', emails: ['ali@domain.com', 'alias@domain.com'] };
            const alice3 = { Name: 'crypto', emails: ['alias@domain.com'] };
            const alicia1 = { Name: 'Alicia', emails: ['alice@domain.com'] };
            const bob1 = { Name: 'Bob', emails: ['wow@domain.com', 'batman@domain.com'] };
            const bob2 = { Name: 'bob', emails: ['bobby@domain.com', 'batman@domain.com'] };
            const carol1 = { Name: 'Carol', emails: ['carolinge@domain.com'] };
            const mallory = { Name: 'Mallory', emails: ['mallory@domain.com', 'alice@domain.com'] };

            const contacts = [alice1, alice2, alicia1, bob1, alice3, bob2, carol1, mallory];
            const mergeable = extractMergeable(contacts);

            expect(mergeable).toEqual([[bob1, bob2], [alice1, alicia1, mallory], [alice2, alice3]]);
        });
        it('should capture together contacts with the same email or the same name', async () => {
            const onlyOne1 = { Name: 'name1', emails: ['email1@domain.com'] };
            const onlyOne2 = { Name: 'name2', emails: ['email1@domain.com', 'email2@domain.com'] };
            const onlyOne3 = { Name: 'name3', emails: ['email2@domain.com', 'email3@domain.com'] };
            const onlyOne4 = { Name: 'name4', emails: ['email3@domain.com'] };
            const onlyOne5 = { Name: 'name1', emails: ['email4@domain.com'] };
            const onlyOne6 = { Name: 'name6', emails: ['email6@domain.com', 'email4@domain.com'] };

            const contacts = [onlyOne1, onlyOne2, onlyOne3, onlyOne4, onlyOne5, onlyOne6];

            expect(extractMergeable(contacts)[0]).toHaveLength(6);
        });
    });

    describe('merge', () => {
        it('should merge fn properties in proper order', async () => {
            const beMerged = [
                [{ pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name1' }],
                [{ pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' }],
                [{ pref: 2, field: 'fn', group: undefined, type: undefined, value: 'name3' }]
            ];

            const mergedPrefs = merge(beMerged).map(({ pref }) => pref);
            expect(mergedPrefs).toEqual([1, 2, 3]);
        });
        it('should only merge properties with different value', async () => {
            const beMerged = [
                [
                    { pref: 1, field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name1' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' }
                ],
                [
                    { pref: 1, field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' }
                ],
                [
                    { pref: 1, field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email2@domain.org' }
                ]
            ];

            expect(merge(beMerged)).toHaveLength(5);
        });
        it('should change email groups when merging so that every email has a different group', async () => {
            const beMerged = [
                [
                    { pref: 1, field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name1' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' }
                ],
                [
                    { pref: 1, field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' }
                ],
                [
                    { pref: 1, field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email2@domain.org' }
                ],
                [
                    { pref: 1, field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email3@domain.org' }
                ]
            ];
            const emailGroups = merge(beMerged)
                .map(({ field, group }) => field === 'email' && group)
                .filter(Boolean);

            expect(emailGroups).toEqual(['item1', 'item2', 'item3']);
        });
    });
});
