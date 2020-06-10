import { linkConnections, extractMergeable, extractNewValue, merge } from '../src/app/helpers/merge';

describe('merge', () => {
    describe('linkConnections', () => {
        it('should return same if no connections should be linked', () => {
            const connections = [
                [1, 2],
                [3, 4]
            ];
            expect(linkConnections(connections)).toEqual(connections);
        });

        it('should return same if there is only one connection', () => {
            const connections = [[1, 2, 3, 4]];
            expect(linkConnections(connections)).toEqual(connections);
        });

        it('should return same if there are no connections', () => {
            const connections = [];
            expect(linkConnections(connections)).toEqual(connections);
        });

        it('should work as expected for a few cases', () => {
            const cases = [
                [
                    [1, 8, 2],
                    [9, 10, 5],
                    [2, 4],
                    [3, 5]
                ],
                [
                    [1, 8, 2],
                    [9, 10, 5],
                    [2, 4],
                    [3, 5],
                    [4, 9]
                ],
                [
                    [1, 2],
                    [2, 3],
                    [3, 4],
                    [4, 5],
                    [5, 6],
                    [1, 8],
                    [7, 9]
                ]
            ];
            const resultsSorted = cases.map((cs) => linkConnections(cs).map((c) => c.sort((a, b) => a - b)));
            const expectedSorted = [
                [
                    [1, 2, 4, 8],
                    [3, 5, 9, 10]
                ],
                [[1, 2, 3, 4, 5, 8, 9, 10]],
                [
                    [1, 2, 3, 4, 5, 6, 8],
                    [7, 9]
                ]
            ];
            expect(resultsSorted).toEqual(expectedSorted);
        });
    });

    describe('extractMergeable', () => {
        it('should capture together contacts with the same name', () => {
            const alice1 = { Name: 'Alice', emails: ['alice@domain.com'] };
            const alice2 = { Name: 'alice', emails: ['ali@domain.com'] };
            const alice3 = { Name: 'Alice', emails: ['alias@domain.com'] };
            const alicia1 = { Name: 'Alicia', emails: ['alicia@domain.com'] };
            const bob1 = { Name: 'Bob', emails: ['wow@domain.com', 'batman@domain.com'] };
            const bob2 = { Name: 'bob', emails: ['bobby@domain.com'] };
            const carol1 = { Name: 'Carol', emails: ['carolinge@domain.com'] };

            const contacts = [alice1, alice2, alicia1, bob1, alice3, bob2, carol1];
            const mergeable = extractMergeable(contacts);

            expect(mergeable).toEqual([
                [alice1, alice2, alice3],
                [bob1, bob2]
            ]);
        });

        it('should capture together contacts with the same email', () => {
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

            expect(mergeable).toEqual([
                [bob1, bob2],
                [alice1, alicia1, mallory],
                [alice2, alice3]
            ]);
        });

        it('should capture together contacts with the same email or the same name', () => {
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

    describe('extractNewValue', () => {
        it('should return the value if there are no merged values', () => {
            const value = 'new';
            const { newValue } = extractNewValue(value, 'name', []);
            expect(newValue).toEqual(value);
        });

        it('should capture only new values for fields different (up to normalization) from adr', () => {
            const mergedValues = ['Old', 'older'];
            const values = [' old ', 'new'];
            const expectedNewValues = ['new'];
            const newValues = values
                .map((value) => extractNewValue(value, 'name', mergedValues).newValue)
                .filter(Boolean);
            expect(newValues).toEqual(expectedNewValues);
        });
        it('should capture only new values (up to trimming) of email properties', () => {
            const mergedValues = ['john.doe@microsoft.com'];
            const values = ['John.Doe@microsoft.com', 'john.doe@microsoft.com  '];
            const expectedNewValues = ['John.Doe@microsoft.com'];
            const newValues = values
                .map((value) => extractNewValue(value, 'email', mergedValues).newValue)
                .filter(Boolean);
            expect(newValues).toEqual(expectedNewValues);
        });

        it('should capture only new values (up to normalization) for adr field', () => {
            const mergedValues = [
                ['', '', 'Old Street', 'old city', 'old region', 'old postal code', 'old country'],
                ['', '', 'older street', 'older city', 'older region', 'older postal code', 'older country']
            ];
            const values = [
                ['', '', 'old street', ' Old City  ', 'old region', 'old postal code', 'old COUNTRY'],
                ['', '', 'older street', 'New city', 'older region', 'older postal code', 'older country']
            ];
            const expectedNewValues = [
                ['', '', 'older street', 'New city', 'older region', 'older postal code', 'older country']
            ];
            const newValues = values
                .map((value) => extractNewValue(value, 'adr', mergedValues).newValue)
                .filter(Boolean);
            expect(newValues).toEqual(expectedNewValues);
        });

        it('should capture only new values (up to normalization) for N field', () => {
            const mergedValues = [['Stevenson', 'John', ['Philip', 'Paul'], 'Dr.', ['Jr.', 'M.D.', 'A.C.P.']]];
            const values = [
                ['Stevenson', 'John', 'Philip', 'Dr.', 'jr.'],
                ['Stevenson', 'John', ['Philip', 'Paul', 'Peter'], 'Dr', 'Jr.']
            ];
            const expectedNewValues = [['Stevenson', 'John', ['Philip', 'Paul', 'Peter'], 'Dr', 'Jr.']];
            const newValues = values
                .map((value) => extractNewValue(value, 'adr', mergedValues).newValue)
                .filter(Boolean);
            expect(newValues).toEqual(expectedNewValues);
        });
    });

    describe('merge', () => {
        it('should merge fn properties in proper order', () => {
            const beMerged = [
                [{ pref: 1, field: 'fn', value: 'name1' }],
                [
                    { pref: 1, field: 'fn', value: 'name2' },
                    { pref: 2, field: 'fn', value: 'name3' }
                ],
                [{ pref: 1, field: 'fn', value: 'name4' }]
            ];

            const mergedPrefs = merge(beMerged).map(({ pref }) => pref);
            expect(mergedPrefs).toEqual([1, 2, 3, 4]);
        });

        it('should only merge properties with different value', () => {
            const beMerged = [
                [
                    { field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name1' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' }
                ],
                [
                    { field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' }
                ],
                [
                    { field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email2@domain.org' }
                ]
            ];

            expect(merge(beMerged)).toHaveLength(5);
        });

        it('should change email groups when merging', () => {
            const beMerged = [
                [
                    { field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name1' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' },
                    { pref: 2, field: 'email', group: 'item2', type: 'email', value: 'email2@domain.org' }
                ],
                [
                    { field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' },
                    { pref: 2, field: 'email', group: 'item2', type: 'email', value: 'email3@domain.org' }
                ],
                [
                    { field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email2@domain.org' }
                ],
                [
                    { field: 'version', group: undefined, type: undefined, value: '4.0' },
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name2' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email4@domain.org' }
                ]
            ];
            const emailGroups = merge(beMerged)
                .map(({ field, group }) => field === 'email' && group)
                .filter(Boolean);

            expect(emailGroups).toEqual(['item1', 'item2', 'item3', 'item4']);
        });

        it('should merge contacts with several emails', () => {
            const beMerged = [
                [
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name1' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email1@domain.org' }
                ],
                [
                    { pref: 1, field: 'fn', group: undefined, type: undefined, value: 'name1' },
                    { pref: 1, field: 'email', group: 'item1', type: 'email', value: 'email2@domain.org' },
                    { pref: 2, field: 'email', group: 'item2', type: 'email', value: 'email3@domain.org' }
                ]
            ];
            const merged = merge(beMerged);
            const mergedFNPrefs = merged.filter(({ field }) => field === 'fn').map(({ pref }) => pref);
            const mergedFNValues = merged.filter(({ field }) => field === 'fn').map(({ value }) => value);
            const mergedEMAILPrefs = merged.filter(({ field }) => field === 'email').map(({ pref }) => pref);
            const mergedEMAILValues = merged.filter(({ field }) => field === 'email').map(({ value }) => value);
            const mergedEMAILGroups = merged.filter(({ field }) => field === 'email').map(({ group }) => group);

            expect(mergedFNPrefs).toEqual([1]);
            expect(mergedFNValues).toEqual(['name1']);
            expect(mergedEMAILPrefs).toEqual([1, 2, 3]);
            expect(mergedEMAILValues).toEqual(['email1@domain.org', 'email2@domain.org', 'email3@domain.org']);
            expect(mergedEMAILGroups).toEqual(['item1', 'item2', 'item3']);
        });

        it('should merge contacts with several properties properly', () => {
            const beMerged = [
                [
                    { pref: 1, field: 'fn', value: 'name1' },
                    { pref: 1, field: 'email', value: 'email1@domain.org' },
                    { pref: 2, field: 'email', value: 'email2@domain.org' },
                    { pref: 3, field: 'email', value: 'email3@domain.org' },
                    { pref: 1, field: 'tel', value: '123-123-123' },
                    { field: 'org', value: 'ACME' },
                    { field: 'photo', value: 'base64' },
                    {
                        pref: 1,
                        field: 'adr',
                        value: ['PObox1', 'extAdr1', 'street1', 'city1', 'region1', 'postalCode1', 'country1']
                    },
                    {
                        pref: 2,
                        field: 'adr',
                        value: ['PObox2', 'extAdr2', 'street2', 'city2', 'region2', 'postalCode2', 'country2']
                    }
                ],
                [
                    { pref: 1, field: 'fn', value: 'name2' },
                    { pref: 1, field: 'email', value: 'email1@domain.org' },
                    { pref: 1, field: 'tel', value: '1234-1234' },
                    {
                        pref: 1,
                        field: 'adr',
                        value: ['PObox2', 'extAdr2', 'street2', 'city2', 'region2', 'postalCode2', 'country2']
                    },
                    { field: 'org', value: 'ACME SA' }
                ],
                [
                    { pref: 1, field: 'fn', value: 'name1' },
                    { pref: 1, field: 'tel', value: '12345-12345' },
                    { pref: 2, field: 'tel', value: '1234-1234' },
                    {
                        pref: 1,
                        field: 'adr',
                        value: ['PObox3', 'extAdr3', 'street3', 'city3', 'region3', 'postalCode3', 'country3']
                    }
                ]
            ];
            const merged = merge(beMerged);
            const mergedFNPrefs = merged.filter(({ field }) => field === 'fn').map(({ pref }) => pref);
            const mergedFNValues = merged.filter(({ field }) => field === 'fn').map(({ value }) => value);
            const mergedEMAILPrefs = merged.filter(({ field }) => field === 'email').map(({ pref }) => pref);
            const mergedEMAILValues = merged.filter(({ field }) => field === 'email').map(({ value }) => value);
            const mergedTELPrefs = merged.filter(({ field }) => field === 'tel').map(({ pref }) => pref);
            const mergedTELValues = merged.filter(({ field }) => field === 'tel').map(({ value }) => value);
            const mergedADRPrefs = merged.filter(({ field }) => field === 'adr').map(({ pref }) => pref);
            const mergedADRValues = merged.filter(({ field }) => field === 'adr').map(({ value }) => value);
            expect(mergedFNPrefs).toEqual([1, 2]);
            expect(mergedFNValues).toEqual(['name1', 'name2']);
            expect(mergedEMAILPrefs).toEqual([1, 2, 3]);
            expect(mergedEMAILValues).toEqual(['email1@domain.org', 'email2@domain.org', 'email3@domain.org']);
            expect(mergedTELPrefs).toEqual([1, 2, 3]);
            expect(mergedTELValues).toEqual(['123-123-123', '1234-1234', '12345-12345']);
            expect(mergedADRPrefs).toEqual([1, 2, 3]);
            expect(mergedADRValues).toEqual([
                ['PObox1', 'extAdr1', 'street1', 'city1', 'region1', 'postalCode1', 'country1'],
                ['PObox2', 'extAdr2', 'street2', 'city2', 'region2', 'postalCode2', 'country2'],
                ['PObox3', 'extAdr3', 'street3', 'city3', 'region3', 'postalCode3', 'country3']
            ]);
        });
    });
});
