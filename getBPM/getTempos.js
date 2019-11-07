/**
 * Translate interval data to beats per minute
 * @param intervals an array of intervals
 * @param sampleRate the sample rate of the song, samples per second (kHz)
 */

const getTempos = (intervals, sampleRate) => {
  let tempoCounts = [];

  intervals.forEach(interval => {
    if (interval !== 0 || !interval.isNaN()) {
      // translate intervals to BPM
      let theoreticalTempo = 60 / (interval.interval / sampleRate);

      // Getting bpm with in range
      while (theoreticalTempo < 90) theoreticalTempo *= 2;
      while (theoreticalTempo > 180) theoreticalTempo /= 2;

      theoreticalTempo = Math.round(theoreticalTempo);

      /**
       * Check if BPM been found before and add them together.
       */

      let foundTempo = tempoCounts.some(tempoCount => {
        if (tempoCount.tempo === theoreticalTempo) {
          return (tempoCount.count += interval.count);
        }
      });

      /**
       * Add a unique tempo to the collection
       */

      if (!foundTempo) {
        tempoCounts.push({
          tempo: theoreticalTempo,
          count: interval.count,
        });
      }
    }
  });

  return tempoCounts.sort((a, b) => b.count - a.count);
};

export default getTempos;
