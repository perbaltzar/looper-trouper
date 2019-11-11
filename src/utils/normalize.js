/**
 * return values based on the highest value
 * @param peaks an array of audio peaks
 */
const normalize = peaks => {
  let max = Math.max(...peaks);
  max += max * 0.1;
  return peaks.map(peak => peak / max);
};

export default normalize;
