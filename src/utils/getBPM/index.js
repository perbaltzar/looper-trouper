import getIntervals from './getIntervals';
import getTempos from './getTempos';
import getPeaks from './getPeaks';
import getFilteredSource from './getFilteredSource';

/**
 * Return BPM of song data
 * @param song Url to song
 */
const getBPM = async song => {
  const context = new window.AudioContext();
  const response = await fetch(song);
  const buffer = await response.arrayBuffer();
  const decodedBuffer = await context.decodeAudioData(
    buffer,
    decoded => {
      return decoded;
    },
    error => {
      console.log(error);
    },
  );

  // Don't think the filters doing so much work just yet, but it's working
  const lowSource = await getFilteredSource(decodedBuffer, 40, 130);
  const midSource = await getFilteredSource(decodedBuffer, 300, 750);

  const peaks = [await getPeaks(lowSource), await getPeaks(midSource)];

  // Loop through peaks data
  const tempos = [];
  peaks.forEach(p => {
    const i = getIntervals(p);

    // get BPM from the five most frequent intervals
    const t = getTempos(i, context.sampleRate).slice(0, 5);
    tempos.push(t);
  });

  // Check both sources peaks and add them together
  const addedTempos = [];
  tempos.forEach(tempo => {
    tempo.forEach(t => {
      let newTempo = addedTempos.some(tempo => {
        if (tempo.tempo === t.tempo) {
          return (tempo.count += t.count);
        }
      });

      if (!newTempo) {
        addedTempos.push(t);
      }
    });
  });

  // return the most frequent tempo found
  return addedTempos[0].tempo;
};

export default getBPM;
