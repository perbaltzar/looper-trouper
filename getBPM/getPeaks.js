import getPeaksAtThreshold from './getPeaksAtThreshold';

/**
 * Return array of peaks of the highest amplitude
 * @param buffer array of peaks
 */
const getPeaks = async buffer => {
  let threshold = 2;

  const minThreshold = 0.3;
  let peaks = [];
  const minPeaks = 15;

  /**
   * Lowering the threshold value until enough peaks found
   */
  while (peaks.length < 15 && threshold > minThreshold) {
    peaks = getPeaksAtThreshold(buffer, threshold);
    threshold -= 0.05;
  }

  /**
   * Error if not enough peaks are found
   */
  if (peaks.length < minPeaks) {
    throw new Error('Could not find enough samples for a reliable detection.');
  }
  return peaks;
};

export default getPeaks;
