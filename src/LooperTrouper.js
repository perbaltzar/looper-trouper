import * as PIXI from 'pixi.js';
import createAudioBuffer from './utils/createAudioBuffer';
import getBPM from './utils/getBPM';
import getPeaks from './utils/getPeaks';
import Bar from './Bar';
import ProgressLocator from './ProgressLocator';
import Loop from './Loop';
import LoopMousePointer from './LoopMousePointer';

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
  /** @property {Number} progress seconds played */
  /** @property {Number} progressPercent percentage played */
  /** @property {Number} firstBeat Index of first beat of suggested loop */
  /** @property {Number} lastBeat Index of last beat of suggested loop */
  /** @property {Boolean} looped if this is a loop */
  /** @property {ProgressLocator} locator PIXI.Sprite of progress */
  /** @property {Bar} bars PIXI.Graphics of wave bars */
  /** @property {Loop} loopGraphics PIXI.Graphics of loop */
  /** @property {LoopMousePointer} loopMousePointer PIXI.Graphics of loop */
  /** @property {Boolean} doDraw redraw graphics once when true */
  /** @property {Boolean} placingLoop true if user is placing loop */
  /** @property {Number} loopStart time where loop start */
  /** @property {Number} loopEnd time where loop end */
  /** @property {mitt} emitter emitt events */
  /** @property {Boolean} isLooped if player should played the selected loop */
  /** @property {[BiquadFilterNode]} eq an array of the eq filters */
  /** @property {Boolean} eqOn if the eq is on */
  /** @property {BiquadFilterNode} lowpass the low pass filter */
  /** @property {Boolean} lowPassOn if the lowpass is on */
  /** @property {BiquadFilterNode} highpass if highpass is on*/
  /** @property {Boolean} highPassOn if the eq is on */

  constructor(view, width, height, looped, emitter) {
    this.progress = 0;
    this.doDraw = false;
    this.createPixi(view, width, height);
    this.audioContext = new window.AudioContext();
    this.state = PAUSED;
    this.width = width;
    this.height = height;
    this.locator = new ProgressLocator(100, height, this.pixi.stage);
    this.loopGraphics = new Loop(1, 100, height, this.pixi.stage);
    this.loopMousePointer = new LoopMousePointer(this.pixi.stage);
    this.looped = looped || false;
    this.placingLoop = false;
    this.loopStart = null;
    this.loopEnd = null;
    this.emitter = emitter;
    this.setStartTime(this.getNow());
    this.isLooped = false;
    this.bars = [];

    // Filters
    this.eq = [
      this.createFilter('peaking', 60),
      this.createFilter('peaking', 240),
      this.createFilter('peaking', 1000),
      this.createFilter('peaking', 3500),
      this.createFilter('peaking', 8000),
    ];
    this.lowpass = this.createFilter('lowpass', 14000);
    this.highpass = this.createFilter('highpass', 0);
    this.eqOn = false;
    this.lowPassOn = false;
    this.highPassOn = false;
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
      resolution: 2,
    });

    // ? Click event
    this.pixi.renderer.plugins.interaction.on('pointerdown', event => {
      // the position in percent
      const { x, y } = event.data.global;

      if (this.placingLoop) {
        this.loopMousePointer.isVisible = false;
        this.placingLoop = false;
        return;
      }
      if (y > 30 && !this.placingLoop) {
        this.changeLocatorPosition(x);
      }
      if (y < 30 && !this.placingLoop) {
        this.loopMousePointer.isVisible = true;
        this.loopGraphics.start = x;
        this.placingLoop = true;
      }
    });

    this.pixi.renderer.plugins.interaction.on('pointerup', event => {
      if (this.placingLoop) {
        const start = this.duration * (this.loopGraphics.start / this.width);
        const end = this.duration * (this.loopGraphics.end / this.width);
        this.setLoopPosition(start, end);
        this.placingLoop = false;
        this.loopMousePointer.isVisible = false;
      }
    });

    this.pixi.renderer.plugins.interaction.on('pointerupoutside', event => {
      if (this.placingLoop) {
        const start = this.duration * (this.loopGraphics.start / this.width);
        const end = this.duration * (this.loopGraphics.end / this.width);
        this.setLoopPosition(start, end);
        this.placingLoop = false;
        this.loopMousePointer.isVisible = false;
      }
    });

    this.pixi.renderer.plugins.interaction.on('mousemove', event => {
      const { x, y } = event.data.global;
      if (y < 30 && y > 0) {
        this.loopMousePointer.x = x + 5;
        this.loopMousePointer.y = y;
      } else {
        this.loopMousePointer.x = -100;
        this.loopMousePointer.y = -100;
      }
    });
    this.ticker();
  }

  /**
   * load audio buffer and get all data we need
   * @param url Url to audio file
   */

  async loadAudio(url) {
    this.reset();
    this.buffer = await createAudioBuffer(this.audioContext, url);
    this.bpm = await getBPM(url);
    this.peaks = getPeaks(this.buffer, 300);
    this.duration = this.buffer.duration;
    this.sampleRate = this.buffer.sampleRate;
    this.createSource();
    this.bars = this.createBars();
    this.fireEvent('loaded');
  }

  /**
   * loads buffer in LooperTrouper
   * @param buffer audio buffer
   */
  loadBuffer(buffer) {
    this.reset();
    this.peaks = getPeaks(buffer, 300);
    this.duration = this.buffer.duration;
    this.sampleRate = this.buffer.sampleRate;
    this.createSource();
    this.bars = this.createBars();
    this.fireEvent('loaded');
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
   * return object with file information
   */
  getFileInformation() {
    return {
      name: this.name,
      duration: this.duration,
      bpm: this.bpm,
    };
  }

  /**
   * return this duration
   */
  getDuration() {
    return this.duration;
  }

  /**
   * creates and save a new BufferSource
   */
  createSource() {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = this.looped;

    let connections = [];
    if (this.eqOn) {
      connections = [...this.eq];
    }
    if (this.lowPassOn) {
      connections = [...connections, this.lowpass];
    }
    if (this.highPassOn) {
      connections = [...connections, this.highpass];
    }
    if (connections.length > 0) {
      this.source.connect(connections[0]);
      let i = 1;
      for (i; i < connections.length; i++) {
        connections[i - 1].connect(connections[i]);
      }
      connections[i - 1].connect(this.audioContext.destination);
      return;
    }
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
    this.reDraw();
  }

  /**
   * toggle playing loop on and off
   */
  toogleLoop() {
    this.isLooped = !this.isLooped;
  }

  /**
   * return if the loop is playing
   */
  isLooped() {
    return this.isLooped;
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
  }

  /**
   * ? Click Event
   * Changes position of the locator and plays from there if is playing
   * @param x the X position
   */
  changeLocatorPosition(x) {
    const position = x - this.locator.width / 2;
    this.locator.moveTo(position);
    const time = this.duration * (position / this.width);
    this.seekTo(time);
    this.setStartTime(time);
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
  ticker() {
    this.pixi.ticker.add(() => {
      if (this.state === PLAYING || this.doDraw) {
        // Get progress
        const progress = (this.width * this.getProgressPercent()) / 2;

        // Check if bars should change color
        this.bars.forEach(bar => bar.tick(progress));

        // Look for eventsFired when clip finished
        if (this.getProgressPercent() > 0.99999) {
          this.setStartTime();
        }

        // Place locator
        this.locator.tick(this.width * this.getProgressPercent());

        // Mouse Pointer
        this.loopMousePointer.tick();

        // Play loop
        if (this.isLooped && this.hasLoop()) {
          if (this.getProgressPlayed() > this.loopEnd) {
            this.changeLocatorPosition(this.width * (this.loopStart / this.duration));
          }
        }

        if (this.reDraw) this.doDraw = false;
      }
      if (this.placingLoop) {
        const mouseX = this.pixi.renderer.plugins.interaction.mouse.global.x;

        this.loopGraphics.placeEnd(mouseX);
        this.loopGraphics.draw();
      }
    });
  }

  /**
   * return true if loop is set
   */
  hasLoop() {
    return this.loopStart !== null && this.loopEnd !== null;
  }

  /**
   * saves loop time position
   * @param start time
   * @param end time
   */
  setLoopPosition(start, end) {
    this.loopStart = start;
    this.loopEnd = end;
  }

  /**
   * return loop position
   */
  getLoopPosition() {
    return { start: this.loopStart, end: this.loopEnd };
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
      this.sampleRate,
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
    const start = (firstBeat / this.duration) * this.width;
    const end = (lastBeat / this.duration) * this.width;
    this.setLoopGraphicsPosition(start, end);
    return { start: firstBeat, end: lastBeat };
  }

  /**
   * fire an event
   * @param event name of event to be fire
   */
  fireEvent(event) {
    this.emitter.emit(event);
  }

  /**
   * Adds and connects a filter to source
   * @param type filter type
   * @param hz frequenzy of the filter
   */
  createFilter(type, hz) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = hz;
    return filter;
  }

  /**
   * MyName
   * @param myParam explain the param
   */
  changeFilterGain(filter, gain) {
    filter.gain.value = gain;
  }

  /**
   * toggle low pass on and off
   */
  toggleHighPass() {
    this.highPassOn = !this.highPassOn;
    this.setStartTime(this.getProgress());
    this.play();
  }

  /**
   * changes the freq of the high pass filter
   * @param hz the frequency to change to
   */
  setHighPassFrequency(hz) {
    this.highpass.frequency.setValueAtTime(hz, 0);
  }

  /**
   * toggle low pass on and off
   */
  toggleLowPass() {
    this.lowPassOn = !this.lowPassOn;
    this.setStartTime(this.getProgress());
    this.play();
  }

  /**
   * changes the freq of the low pass filter
   * @param hz the frequency to change to
   */
  setLowPassFrequency(hz) {
    this.lowpass.frequency.setValueAtTime(hz, 0);
  }

  /**
   * turn eq on and off
   */
  toggleEq() {
    this.eqOn = !this.eqOn;
    this.setStartTime(this.getProgress());
    this.play();
  }

  /**
   * set the gain of the low in eq
   * @param gain
   */
  setLowGain(gain) {
    this.eq[0].gain.value = gain;
  }

  /**
   * set the gain of the low mid in eq
   * @param gain
   */
  setLowMidGain(gain) {
    this.eq[1].gain.value = gain;
  }

  /**
   * set the gain of the low mid in eq
   * @param gain
   */
  setMidGain(gain) {
    this.eq[2].gain.value = gain;
  }

  /**
   * set the gain of the low mid in eq
   * @param gain
   */
  setHighMidGain(gain) {
    this.eq[3].gain.value = gain;
  }

  /**
   * set the gain of the low mid in eq
   * @param gain
   */
  setHighGain(gain) {
    this.eq[4].gain.value = gain;
  }

  /**
   * reset all variables
   */
  reset() {
    this.disconnectSource();
    this.pause();
    this.state = PAUSED;
    this.loopStart = null;
    this.loopEnd = null;
    this.loopGraphics.clear();
    this.isLooped = false;
    this.setStartTime(this.getNow());

    // reset graphics
    if (this.bars) {
      this.bars.forEach(bar => {
        bar.clear();
      });
    }
    this.changeLocatorPosition(0);
    this.progress = 0;
  }
}
