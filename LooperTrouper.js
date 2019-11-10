import * as PIXI from 'pixi.js';
import createAudioBuffer from './functions/createAudioBuffer';
import getBPM from './functions/getBPM';
import getPeaks from './functions/getPeaks';
import Bar from './Bar';
import ProgressLocator from './ProgressLocator';

// Constant to prevent spellingmistakes
const PLAYING = 'playing';
const PAUSED = 'paused';

export default class LooperTrouper {
  /** @property {Number} width */
  /** @property {Number} height */
  /** @property {AudioContext} audioContext */
  /** @property {PIXI.Application} pixi */
  /** @property {AudioBufferSourceNode} source audio source  */
  /** @property {AudioBuffef} buffer the audio data */
  /** @property {Number} sampleRate sample rate of the audio */
  /** @property {String} name of audio file */
  /** @property {Number} duration of audio file in seconds */
  /** @property {Number} size of audio file */
  /** @property {[Number]} peaks  the peaks from -1 to 1 */
  /** @property {String} state current state  */
  /** @property {Number} startTime dynamic start time from context */
  /** @property {Number} progressTime seconds played */
  /** @property {Number} progressPercent percentage played */
  /** @property {Number} firstBeat Index of first beat of suggested loop */
  /** @property {Number} lastBeat Index of last beat of suggested loop */
  /** @property {Boolean} looped if this is a loop */

  constructor(view, width, height, looped) {
    this.pixi = this.createPixi(view, width, height);
    this.audioContext = new window.AudioContext();
    this.state = PAUSED;
    this.startTime = this.audioContext.currentTime;
    this.width = width;
    this.height = height;
    this.progressLocator = new ProgressLocator(0, height, this.pixi.stage);
    this.looped = looped || false;
  }

  /**
   * return a PIXI.Application
   * @param view HTML element to use as canvas
   * @param width width of the element
   * @param height height of the element
   */
  createPixi(view, width, height) {
    return (this.pixi = new PIXI.Application({
      view: view,
      width: width,
      height: height,
      transparent: true,
      resolution: 2
    }));
  }

  /**
   * load audio buffer and get all data we need
   * @param url Url to audio file
   */
  async loadAudio(url) {
    this.buffer = await createAudioBuffer(this.audioContext, url);
    this.bpm = await getBPM(url);
    this.peaks = getPeaks(this.buffer, 300);
    this.duration = this.buffer.duration;
    this.sampleRate = this.buffer.sampleRate;
    this.createSource();
    this.bars = this.createBars();
    this.createUpdateWaveform();
  }

  loadBuffer(buffer) {
    this.peaks = getPeaks(buffer, 300);
    this.duration = this.buffer.duration;
    this.sampleRate = this.buffer.sampleRate;
    this.createSource();
    this.bars = this.createBars();
    this.createUpdateWaveform();
  }

  /**
   * saves file information
   * @param name name of the file
   * @param size size of the file
   */
  setFileInformation(name, size) {
    this.name = name;
    this.size = size;
  }

  /**
   * creates and save a new BufferSource
   */
  createSource() {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = this.looped;
    this.source.connect(this.audioContext.destination);
  }

  /**
   * remove current BufferSource
   */
  disconnectSource() {
    if (this.source) this.source.disconnect();
  }

  /**
   * return audio buffer
   */
  getAudioBuffer() {
    return this.audioBuffer;
  }

  /**
   * Set audio buffer in class
   * @param buffer Audio Buffer
   */
  setAudioBuffer(buffer) {
    this.buffer = buffer;
  }

  /**
   * returns true if player is playing
   */
  isPlaying() {
    return this.state === PLAYING;
  }

  /**
   * pause or play the audio
   */
  playPause() {
    if (this.isPlaying()) {
      this.setProgressTime();
      this.pause();
      return;
    }
    this.setStartTime(this.progressTime);
    this.play(this.progressTime);
    return;
  }

  /**
   * plays the audio
   * @param position position to play from
   */
  play(position) {
    position = position || 0;
    this.disconnectSource();
    this.createSource();
    this.source.start(0, position);
    this.state = PLAYING;
  }

  /**
   * pause the audio
   */
  pause() {
    this.disconnectSource();
    this.state = PAUSED;
  }

  /**
   * Skips 5 seconds forward
   */
  forwardFive() {
    this.disconnectSource();
    this.createSource();
    if (this.getProgressTime() + 5 > this.duration) {
      // Code to set finished.
    }
    this.source.start(0, this.getProgressTime() + 5);
    this.setStartTime(this.getProgressTime() + 5);
  }

  /**
   * rewinds 5 seconds
   */
  backFive() {
    let time = this.getProgressTime() - 5;
    this.disconnectSource();
    this.createSource();
    if (time < 0) {
      time = 0;
    }
    this.source.start(0, time);
    this.setStartTime(time);
  }

  /**
   * sets a new start time
   * @param offset if audio clip not played from beginning
   */
  setStartTime(offset) {
    offset = offset || 0;
    this.startTime = this.audioContext.currentTime - offset;
  }

  /**
   * time in seconds of the audio clip played
   */
  setProgressTime() {
    this.progressTime = this.audioContext.currentTime - this.startTime;
  }

  /**
   * return time in seconds of the audio clip played
   */
  getProgressTime() {
    return this.audioContext.currentTime - this.startTime;
  }

  /**
   * saves the progress in percent
   */
  setProgressPercent() {
    this.progressPercent = this.getProgressTime() / this.duration;
  }

  /**
   * return the progress in percent
   */
  getProgressPercent() {
    return this.getProgressTime() / this.duration;
  }

  /**
   * return Bars based on peaks and width
   */
  createBars() {
    let x = 0;
    const width = this.width / this.peaks.length / 2;
    const bars = this.peaks.map(peak => {
      x += width;
      const height = peak * this.height;
      const y = this.height / 4 - height / 4;

      const bar = new Bar(x, y, width, height, this.pixi.stage);
      return bar;
    });
    return bars;
  }

  /**
   * Loop to change colors of played bars
   */
  createUpdateWaveform() {
    this.pixi.ticker.add(() => {
      if (this.state === PLAYING) {
        // Place locator
        // this.progressLocator.update(this.width * this.getProgressPercent());
        // Check if wavebar should change color
        for (let i = 0; i < this.bars.length; i++) {
          const progress = (this.width * this.getProgressPercent()) / 2;
          if (!this.bars[i].played && this.bars[i].x < progress) {
            this.bars[i].played = true;
            this.bars[i].draw();
          } else if (this.bars[i].played && this.bars[i].x > progress) {
            this.bars[i].played = false;
            this.bars[i].draw();
          }
        }
        // Look for eventsFired when clip finished
        if (this.getProgressPercent() > 0.99999) {
          this.setStartTime();
        }
      }
    });
  }

  /**
   * returns a part of the current audio file
   * @param start loop start in seconds
   * @param end loop end in seconds
   */
  exportLoop(start, end) {
    if (!start || !end) {
      console.log('no duration given');
      return {};
    }
    // get duration, sampleRate, start and  from region, sampleRate translate seconds to index
    const sampleRate = this.sampleRate;

    const loopDuration = (end - start) * this.sampleRate;

    // Translate time to index
    start = start * this.sampleRate;
    end = end * this.sampleRate;

    //  create an empty buffer
    const copy = this.audioContext.createBuffer(
      this.buffer.numberOfChannels,
      loopDuration,
      this.sampleRate
    );

    for (let i = 0; i < this.buffer.numberOfChannels; i++) {
      const chanData = this.buffer.getChannelData(i);
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
  }

  /**
   * returns the time of the first real beat
   * @param buffer Web Audio Audio Buffer
   */
  findFirstBeat() {
    // calculating the resolution needed by duration 100 per second
    const partsPerSecond = 50;
    const resolution = Math.round(this.duration * partsPerSecond);

    // Loop through and check difference between peaks, lower the need to check different songs
    let topPeak = 1;

    // lowest criteria in difference to trust the value
    const j = 0.2;
    let firstIndex = 0;
    while (j < topPeak && firstIndex === 0) {
      for (let i = 0; i < this.peaks.length; i++) {
        const diff = this.peaks[i] - this.peaks[i + 1];
        if (diff > topPeak && i < resolution * 0.3) {
          firstIndex = i;
          break;
        }
      }
      topPeak -= 0.1;
    }

    // get time from index
    this.firstBeat = (firstIndex / resolution) * this.duration;
  }

  findLastBeat(minDuration) {
    const secondsPerBeat = 60 / this.bpm;
    let lastBeat = 0;
    for (let i = 1; lastBeat - this.firstBeat < minDuration; i++) {
      lastBeat = this.firstBeat + secondsPerBeat * 16 * i;
    }
    this.lastBeat = lastBeat;
  }

  /**
   * returns an object with start and end time of suggested loop
   * @param minimumDuration Shortest the loop can be
   */
  suggestLoop(minimumDuration) {
    const firstBeat = this.findFirstBeat();
    const lastBeat = this.findLastBeat(minimumDuration);
    return { start: firstBeat, end: lastBeat };
  }
}
