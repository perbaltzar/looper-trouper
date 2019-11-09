import * as PIXI from 'pixi.js';
import createAudioBuffer from './functions/createAudioBuffer';
import getBPM from './functions/getBPM';

const PLAYING = 'playing';
const PAUSED = 'paused';

export default class LooperTrouper {
  /** @property {AudioContext} audioContext */
  /** @property {AudioBufferSourceNode} source audio source  */
  /** @property {AudioBuffef} buffer the audio data */
  /** @property {String} name of audio file */
  /** @property {Number} duration of audio file in seconds */
  /** @property {Number} size of audio file */
  /** @property {[Number]} peaks  the peaks from -1 to 1 */
  /** @property {String} state current state  */
  /** @property {Number} startTime dynamic start time from context */
  /** @property {Number} progressTime seconds played */
  /** @property {Number} progressPercent percentage played */

  constructor(view, width, height) {
    this.pixi = this.createPixi(view, width, height);
    this.audioContext = new window.AudioContext();
    this.state = PAUSED;
    this.startTime = this.audioContext.currentTime;
  }

  createPixi(view, width, height) {
    return (this.pixi = new PIXI.Application({
      view: view,
      width: width,
      height: height,
      transparent: true
    }));
  }

  async loadAudio(url) {
    this.buffer = await this.getAudioBuffer(url);
    this.bpm = await getBPM(url);
    this.createSource();
  }

  saveFileInformation(file) {
    this.name = file.name;
    this.size = file.size;
  }

  createSource() {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.audioContext.destination);
  }

  disconnectSource() {
    if (this.source) this.source.disconnect();
  }

  getAudioBuffer(url) {
    return createAudioBuffer(this.audioContext, url);
  }

  isPlaying() {
    return this.state === PLAYING;
  }

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

  play(position) {
    position = position || 0;
    this.disconnectSource();
    this.createSource();
    this.source.start(0, position);
    this.state = PLAYING;
  }

  pause() {
    this.disconnectSource();
    this.state = PAUSED;
  }

  forwardFive() {
    this.disconnectSource();
    this.createSource();
    if (this.getProgressTime() + 5 > this.duration) {
      // COde to set finished.
    }
    this.source.start(0, this.getProgressTime() + 5);
    this.setStartTime(this.getProgressTime() + 5);
  }

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

  setStartTime(offset) {
    offset = offset || 0;
    this.startTime = this.audioContext.currentTime - offset;
  }

  setProgressTime() {
    this.progressTime = this.audioContext.currentTime - this.startTime;
  }

  getProgressTime() {
    return this.audioContext.currentTime - this.startTime;
  }

  setProgressPercent() {
    this.progressPercent = this.getProgressTime / this.duration;
  }
}
