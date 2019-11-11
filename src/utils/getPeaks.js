import normalize from './normalize';
/**
 * return peaks from AudioBuffer
 * @param audioBuffer AudioBuffer of selection
 * @param resolution number of peaks
 */
const getPeaks = (audioBuffer, resolution) => {
  const length = audioBuffer.length;
  let samples = audioBuffer.getChannelData(0);
  const steps = Math.floor(length / resolution);

  let peaks = [];
  for (let i = 0; i < resolution; i++) {
    let offset = i * steps;
    let meanValue = 0;
    for (let j = 0; j < steps; j++) {
      if (samples[j + offset] > 0) meanValue += samples[j + offset];
    }
    peaks.push(meanValue / steps);
  }
  return normalize(peaks);
};

export default getPeaks;
