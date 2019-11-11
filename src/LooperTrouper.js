import * as PIXI from 'pixi.js';
import createAudioBuffer from './utils/createAudioBuffer';
import getBPM from './utils/getBPM';
import getPeaks from './utils/getPeaks';
import Bar from './Bar';
import ProgressLocator from './ProgressLocator';
import Loop from './Loop';

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
  /** @property {Number} Progress seconds played */
  /** @property {Number} progressPercent percentage played */
  /** @property {Number} firstBeat Index of first beat of suggested loop */
  /** @property {Number} lastBeat Index of last beat of suggested loop */
  /** @property {Boolean} looped if this is a loop */
  /** @property {ProgressLocator} locator PIXI.Sprite of progress*/
  /** @property {Bar} bars PIXI.Graphics of wave bars*/
  /** @property {Loop} loopGraphics PIXI.Graphics of loop*/
  /** @property {Boolean} doDraw redraw graphics once when true*/

  constructor(view, width, height, looped) {
    this.progress = 0;
    this.doDraw = false;
    this.createPixi(view, width, height);
    this.audioContext = new window.AudioContext();
    this.state = PAUSED;
    this.width = width;
    this.height = height;
    this.locator = new ProgressLocator(100, height, this.pixi.stage);
    this.loopGraphics = new Loop(1, 100, height, this.pixi.stage);
    this.looped = looped || false;
    this.setStartTime(this.getNow());
  }

  /**
   * return a PIXI.Application
   * @param view HTML element to use as canvas
   * @param width width of the element
   * @param height height of the element
   */
  createPixi(view, width, height) {
    this.pixi = this.pixi = new PIXI.Application({
      view: view,
      width: width,
      height: height,
      transparent: true,
      resolution: 2
    });

    // Click event
    this.pixi.renderer.plugins.interaction.on('pointerdown', event => {
      // the position in percent
      const position = event.data.global.x - this.locator.width / 2;
      this.locator.moveTo(position);
      const time = this.duration * (position / this.width);
      this.seekTo(time);
      this.setStartTime(time);
    });
    this.createUpdateWaveform();
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
  }

  loadBuffer(buffer) {
    this.peaks = getPeaks(buffer, 300);
    this.duration = this.buffer.duration;
    this.sampleRate = this.buffer.sampleRate;
    this.createSource();
    this.bars = this.createBars();
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
      this.setProgress(this.getProgressPlayed());
      this.pause();
      return;
    }
    this.setStartTime(this.getProgress());
    this.play();
  }

  /**
   * plays the audio
   * @param position position to play from
   */
  play() {
    this.disconnectSource();
    this.createSource();
    this.source.start(0, this.getProgress());
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
   * plays audio from chosen point
   * @param time the time to start from
   */
  seekTo(time) {
    this.setProgress(time);
    if (this.isPlaying()) {
      this.play();
      return;
    }
    this.reDraw();
  }

  /**
   * Skips 5 seconds forward
   */
  forwardFive() {
    if (this.isPlaying()) {
      this.setProgress(this.getProgressPlayed() + 5);
      this.setStartTime(this.getProgress());
      this.play();
      return;
    }
    this.reDraw();
    this.setProgress(this.getProgress() + 5);
  }

  /**
   * rewinds 5 seconds
   */
  backFive() {
    if (this.isPlaying()) {
      this.setProgress(this.getProgressPlayed() - 5);
      if (this.getProgress() < 0) this.setProgress(0);
      this.setStartTime(this.getProgress());
      this.play();
      return;
    }

    if (this.getProgress() < 5) {
      this.setProgress(0);
    } else {
      this.setProgress(this.getProgress() - 5);
    }
    console.log(this.getProgress());
    this.reDraw();
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
   * return current startTime
   */
  getStartTime() {
    return this.startTime;
  }

  /**
   * return current position in seconds after startTime
   */
  getNow() {
    return this.audioContext.currentTime;
  }

  /**
   * set the progress to now
   */
  getProgress() {
    return this.progress;
  }

  /**
   * set the progress to time
   * @param time position in seconds
   */
  setProgress(time) {
    this.progress = time;
  }

  /**
   * return seconds played of the song
   */
  getProgressPlayed() {
    return this.audioContext.currentTime - this.getStartTime();
  }

  // /**
  //  * return time in seconds of the audio clip played
  //  */
  // getProgress() {
  //   return this.audioContext.currentTime - this.startTime;
  // }

  /**
   * return the progress in percent
   */
  getProgressPercent() {
    if (this.isPlaying()) return this.getProgressPlayed() / this.duration;
    return this.getProgress() / this.duration;
  }
  /**
   * set coordinates of loop
   * @param start loop start position x
   * @param end loop end position x
   */
  setLoopGraphicsPosition(start, end) {
    this.loopGraphics.start = start;
    this.loopGraphics.end = end;
    this.loopGraphics.draw();
    console.log(this.loopGraphics);
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

  reDraw() {
    this.doDraw = true;
  }
  /**
   * Loop to change colors of played bars
   */
  createUpdateWaveform() {
    this.pixi.ticker.add(() => {
      if (this.state === PLAYING || this.doDraw) {
        // Get progress
        const progress = (this.width * this.getProgressPercent()) / 2;

        // Place locator
        this.locator.tick(this.width * this.getProgressPercent());

        // Check if bars should change color
        this.bars.forEach(bar => bar.tick(progress));

        // Look for eventsFired when clip finished
        if (this.getProgressPercent() > 0.99999) {
          this.setStartTime();
        }

        this.loopGraphics.tick();

        if (this.reDraw) this.doDraw = false;
      }
    });
  }

  /**
   * returns a part of the current audio file
   * @param start loop start in seconds
   * @param end loop end in seconds
   */
  exportLoop(start, end) {
    if (start === undefined || end === undefined) {
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

    const peaks = getPeaks(this.buffer, resolution);

    // lowest criteria in difference to trust the value
    const j = 0.2;
    let firstIndex = 0;
    while (j < topPeak && firstIndex === 0) {
      for (let i = 0; i < peaks.length; i++) {
        const diff = peaks[i] - peaks[i + 1];
        if (diff > topPeak && i < resolution * 0.3) {
          firstIndex = i;
          break;
        }
      }
      topPeak -= 0.05;
    }

    // get time from index
    return (this.firstBeat = (firstIndex / resolution) * this.duration);
  }

  /**
   * return position of last beat of the suggested loop
   * @param minimumDuration minimum number of seconds the loop can be
   */
  findLastBeat(minimumDuration) {
    console.log(this.bpm);
    const secondsPerBeat = 60 / this.bpm;
    let lastBeat = 0;
    for (let i = 1; lastBeat - this.firstBeat < minimumDuration; i++) {
      lastBeat = this.firstBeat + secondsPerBeat * 16 * i;
    }
    return (this.lastBeat = lastBeat);
  }

  /**
   * returns an object with start and end time of suggested loop
   * @param minimumDuration Shortest the loop can be
   */
  suggestLoop(minimumDuration) {
    const firstBeat = this.findFirstBeat();
    const lastBeat = this.findLastBeat(minimumDuration);
    this.setLoopGraphicsPosition(firstBeat, lastBeat);
    return { start: firstBeat, end: lastBeat };
  }
}
