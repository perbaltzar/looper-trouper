import * as PIXI from 'pixi.js';
import getBPM from './getBPM/index.js';

const originalCanvas = document.querySelector('#original');
const loopCanvas = document.querySelector('#loop');

const original = PIXI.Application({
  view: originalCanvas,
  width: originalCanvas.offsetWidth,
  height: originalCanvas.offsetHeight
});

const loop = PIXI.Application({
  view: loopCanvas,
  width: loopCanvas.offsetWidth,
  height: loopCanvas.offsetHeight
});
