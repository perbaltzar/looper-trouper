/**
 * Returns array of values that exceeds the threshold
 * @param buffer array of song data
 * @param threshold threshold value
 */

const getPeaksAtThreshold = (buffer, threshold) => {
  const peaks = [];

  for (let i = 0; i < buffer.length; ) {
    if (buffer[i] > threshold) {
      peaks.push(i);

      // skip 1/44 of song to leave current peak
      i += 1000;
    }
    i++;
  }
  return peaks;
};

export default getPeaksAtThreshold;
