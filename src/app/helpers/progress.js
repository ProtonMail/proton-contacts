export const percentageProgress = (done, notDone, total) => {
    if (+total === 0) {
        return 0;
    }
    return Math.floor(((+done + notDone) / total) * 100);
};
