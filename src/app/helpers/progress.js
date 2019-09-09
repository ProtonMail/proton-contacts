/**
 * Calculate progress percentage (0 <= integer <= 100) of a certain process
 * that involves carrying out several tasks, that can either fail or be successful
 * @param {Number} successful   Number of tasks completed successfully
 * @param {Number} failed       Number of tasks that failed
 * @param {Number} total        Total number of tasks
 *
 * @return {Number}
 */
export const percentageProgress = (successful, failed, total) => {
    if (+total === 0) {
        // assume the process has not started
        return 0;
    }
    // in case something goes south, do not allow progress > 100
    return Math.min(Math.floor(((+done + notDone) / total) * 100), 100);
};
