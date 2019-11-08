import * as PIXI from 'pixi.js';
import createAudioBuffer from './functions/getAudioBuffer';

export default class LooperTrouper {
  /** @property audioContext */
  /** @property source  */
  /** @property name  */
  /** @property duration  */
  /** @property size  */
  /** @property buffer  */
  /** @property peaks  */

  constructor(view, width, height) {
    this.pixi = new PIXI.Application({
      view: view,
      width: width,
      height: height,
      transparent: true
    });

    this.audioContext = new window.AudioContext();
  }

  loadAudio() {
    this.audioContext.load(audio);
  }

  saveFileInformation(file) {
    this.name = file.name;
    this.size = file.size;
  }

  createSource(position) {
    position = position || 0;
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.context.destination);
    this.source.start(0, position);
  }

  disconnectSource() {
    this.source.disconnect();
  }

  createAudioBuffer() {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await context.decodeAudioData(
    buffer,
    decoded => {
      this.buffer = decoded;
    },
    error => {
      console.log(error);
    },
  );
};


