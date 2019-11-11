/**
 * @param context Web Audio Context
 * @param original Web Audio AudioBuffer
 * @param start loop start in seconds
 * @param end loop end in seconds
 */

const copyLoop = (context, original, start, end) => {
  if (!start || !end) {
    console.log('no duration given');
    return {};
  }
  // get duration, sampleRate, start and  from region, sampleRate translate seconds to index
  const sampleRate = original.sampleRate;

  const duration = (end - start) * sampleRate;

  // Translate time to index
  start = start * sampleRate;
  end = end * sampleRate;

  //  create an empty buffer
  const copy = context.createBuffer(original.numberOfChannels, duration, sampleRate);

  for (let i = 0; i < original.numberOfChannels; i++) {
    const chanData = original.getChannelData(i);
    let copyData = copy.getChannelData(i);

    let midData = chanData.subarray(start, end);

    // Make sure they're the same length
    if (midData.length > copyData.length) {
      midData = midData.slice(0, copyData.length);
    } else if (midData.length < copyData.length) {
      copyData = copyData.slice(0, midData.length);
    }

    copyData.set(midData);
  }
  return copy;
};

export default copyLoop;
