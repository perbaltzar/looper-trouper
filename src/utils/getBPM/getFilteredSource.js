/**
 * Return an array with peaks after audio source ran through filters
 * @param buffer the decode audio data from context
 * @param lowPass the highest frequenzy for the filter
 * @param highPass the lowest frequenzy for the filter
 */

const getFilteredSource = async (buffer, lowPass, highPass) => {
  // defining context base on buffer
  const context = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);

  // defining low pass filter
  const lowPassFilter = context.createBiquadFilter();
  lowPassFilter.type = 'lowpass';
  lowPassFilter.frequency.setValueAtTime(lowPass, context.currentTime);

  // defining high pass filter
  const highPassFilter = context.createBiquadFilter();
  highPassFilter.type = 'highpass';
  highPassFilter.frequency.setValueAtTime(highPass, context.currentTime);

  // defing source node
  const node = context.createBufferSource();
  node.buffer = buffer;

  // connecting filters with node and destination
  node.connect(lowPassFilter);
  lowPassFilter.connect(highPassFilter);
  highPassFilter.connect(context.destination);

  node.start(0);
  // return
  return node.buffer.getChannelData(0);
};

export default getFilteredSource;
