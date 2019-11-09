import 'regenerator-runtime/runtime';
import * as PIXI from 'pixi.js';
import getBPM from './getBPM/index.js';
import LooperTrouper from './LooperTrouper.js';
import loadFile from './functions/loadFile.js';
import validateFile from './functions/validateFile.js';
import abba from './abba.mp3';

const originalPlayPauseButton = document.querySelector('.original-play-pause');
const originalForward = document.querySelector('.original-forward');
const originalBack = document.querySelector('.original-back');
const dropzone = document.querySelector('.drop-zone');
const dropMessage = document.querySelector('.drop-message');
let dragCounter = 0;

dropzone.addEventListener(
  'drop',
  e => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files;
    if (validateFile(file)) {
      dragCounter = 0;
      dropzone.classList.toggle('hidden');
      dropMessage.classList.add('hidden');
      originalTrouper.loadAudio(abba);
      originalTrouper.saveFileInformation(file[0]);
    }
  },
  false
);

dropzone.addEventListener('dragenter', e => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter++;
  dropzone.classList.toggle('highlight');
  dropMessage.classList.toggle('hidden');
});

dropzone.addEventListener('dragleave', e => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter--;
  if (dragCounter < 1) {
    dropzone.classList.toggle('highlight');
    dropMessage.classList.toggle('hidden');
  }
});

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  e.stopPropagation();
});

const originalCanvas = document.querySelector('#original');

const originalTrouper = new LooperTrouper(
  originalCanvas,
  originalCanvas.width,
  originalCanvas.height
);

originalPlayPauseButton.addEventListener('click', e => {
  originalTrouper.playPause();
});

originalForward.addEventListener('click', e => {
  originalTrouper.forwardFive();
});

originalBack.addEventListener('click', e => {
  originalTrouper.backFive();
});
