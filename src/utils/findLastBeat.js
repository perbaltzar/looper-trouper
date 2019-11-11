/**
 * Find last beat from Bpm
 * @param audio Web Audio AudioBuffer
 * @param firstBeat position of first beat in seconds
 * @param minDuration minum duration odf the loop
 */
const findLastBeat = (audio, firstBeat, minDuration) => {
  const bpm = audio.bpm;
  const secondsPerBeat = 60 / bpm;
  console.log(secondsPerBeat);
  let lastBeat = 0;
  for (let i = 1; lastBeat - firstBeat < minDuration; i++) {
    lastBeat = firstBeat + secondsPerBeat * 16 * i;
  }
  return lastBeat;
};

export default findLastBeat;
