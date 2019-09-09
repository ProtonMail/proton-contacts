export const percentageProgress = (done, notDone, total) => {
    if (+total === 0) {
        return 0;
    }
    // in case something goes south, do not allow progress > 100
    return Math.min(Math.floor(((+done + notDone) / total) * 100), 100);
};
