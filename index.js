import * as PIXI from 'pixi.js';
import getBPM from './getBPM/index.js';
import dropzone from './dropzone.js';
import LooperTrouper from './LooperTrouper.js';

console.log(dropzone);
const originalCanvas = document.querySelector('#original');
const loopCanvas = document.querySelector('#loop');

const OriginalTrouper = new LooperTrouper(
  originalCanvas,
  originalCanvas.width,
  originalCanvas.height
);

console.log(OriginalTrouper);
