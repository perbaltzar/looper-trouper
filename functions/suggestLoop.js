import findFirstBeat from 'functions/findFirstBeat';
import findLastBeat from 'functions/findLastBeat';
/**
 * returns an object with start and end time of suggested loop
 * @param audio Web Audio AudioBuffer
 */
const suggestLoop = (audio, minDuration) => {
  const firstBeat = findFirstBeat(audio.buffer);
  const lastBeat = findLastBeat(audio, firstBeat, minDuration);
  return { start: firstBeat, end: lastBeat };
};

export default suggestLoop;
