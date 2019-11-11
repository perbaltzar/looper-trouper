/**
 * return array of objects with intervals between peaks
 * @param peaks array with peaks data from song
 */

const getIntervals = peaks => {
  const intervals = [];
  peaks.forEach((peak, index) => {
    for (let i = 1; i < 10; i++) {
      const newInterval = peaks[index + i] - peak;

      let foundInterval = intervals.some(interval => {
        // Doing +/- to make the gap bigger for it to hit, for acoustic music.
        if (interval.interval < newInterval - 0 && interval.interval > newInterval + 0) {
          return (interval.count += 1);
        }
      });

      if (!foundInterval) {
        intervals.push({
          interval: newInterval,
          count: 1,
        });
      }
    }
  });
  return intervals;
};

export default getIntervals;
