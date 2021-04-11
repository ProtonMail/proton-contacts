import { combineProgress } from 'proton-shared/lib/contacts/helpers/progress';

describe('combineProgress', () => {
    it('should throw if allocated percentages do not add up to one', () => {
        const processes = [
            { allocated: 0.1, successful: 12, failed: 3, total: 20 },
            { allocated: 0.8, successful: 2, failed: 0, total: 20 },
        ];
        expect(() => combineProgress(processes)).toThrow();
    });
    it('should return 0 if processes is empty', () => {
        const processes = [];
        expect(combineProgress(processes)).toBe(0);
    });
    it('should return 0 if there are no tasks in the processes', () => {
        const processes = [{ allocated: 1, successful: 0, failed: 0, total: 0 }];
        expect(combineProgress(processes)).toBe(0);
    });
    it('should properly take into account processes with no tasks', () => {
        const processes = [
            { allocated: 0.1, successful: 2, failed: 3, total: 10 },
            { allocated: 0.8, successful: 0, failed: 0, total: 0 },
            { allocated: 0.1, successful: 0, failed: 10, total: 10 },
        ];
        expect(combineProgress(processes)).toBe(5 + 80 + 10);
    });
    it('should properly take into account processes with too many tasks', () => {
        const processes = [
            { allocated: 0.2, successful: 20, failed: 0, total: 10 },
            { allocated: 0.8, successful: 0, failed: 0, total: 10 },
        ];
        expect(combineProgress(processes)).toBe(20);
    });
});
