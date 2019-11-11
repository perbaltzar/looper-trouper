import getPeaks from 'functions/getPeaks';

/**
 * returns the time of the first real beat
 * @param buffer Web Audio Audio Buffer
 */
const findFirstBeat = buffer => {
  // duration from buffer
  const duration = buffer.duration;
  const sampleRate = buffer.sampleRate;
  // calculating the resolution needed by duration 100 per second
  // KAN GÖRA EN MER EXAKT UTRÄKNING
  const partsPerSecond = 50;
  const resolution = Math.round(duration * partsPerSecond);

  // Get peaks from function
  const peaks = getPeaks(buffer, resolution);

  // Loop through and check difference between peaks, lower the need to check different songs
  let topPeak = 1;

  // lowest criteria in difference to trust the value
  const j = 0.2;
  let firstIndex = 0;
  while (j < topPeak && firstIndex === 0) {
    for (let i = 0; i < peaks.length; i++) {
      const diff = peaks[i] - peaks[i + 1];
      if (diff > topPeak && i < resolution * 0.3) {
        firstIndex = i;
        break;
      }
    }
    topPeak -= 0.1;
  }

  // get time from index
  const firstBeat = (firstIndex / resolution) * duration;
  return firstBeat;
};

export default findFirstBeat;
