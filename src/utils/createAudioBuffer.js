const createAudioBuffer = async (context, url) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const AudioBuffer = await context.decodeAudioData(
    buffer,
    decoded => {
      return decoded;
    },
    error => {
      console.log(error);
    }
  );
  return AudioBuffer;
};

export default createAudioBuffer;
