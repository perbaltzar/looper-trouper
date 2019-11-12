import "regenerator-runtime/runtime";
import * as PIXI from "pixi.js";
import LooperTrouper from "./LooperTrouper.js";
import loadFile from "./utils/loadFile.js";
import validateFile from "./utils/validateFile.js";
import abba from "./assets/abba.mp3";
import lion from "./assets/lion.mp3";
import turnOffDiodes from "./utils/turnOffDiodes";
const orgPlayDiode = document.querySelector(".org-play-diode");
const originalPlayPauseButton = document.querySelector(".original-play-pause");
const originalForward = document.querySelector(".original-forward");
const originalBack = document.querySelector(".original-back");
const loopPlayPauseButton = document.querySelector(".loop-play-pause");
const loopForward = document.querySelector(".loop-forward");
const loopBack = document.querySelector(".loop-back");
const dropzone = document.querySelector(".drop-zone");
const dropMessage = document.querySelector(".drop-message");
const createLoop = document.querySelector(".smart-loop");
let dragCounter = 0;
const diodes = document.querySelectorAll(".diode");

dropzone.addEventListener(
  "drop",
  e => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files;
    if (validateFile(file)) {
      dragCounter = 0;
      dropzone.classList.toggle("hidden");
      dropMessage.classList.add("hidden");
      originalTrouper.loadAudio(abba);
      originalTrouper.setFileInformation(file[0].name, file[0].size);
    }
  },
  false
);

dropzone.addEventListener("dragenter", e => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter++;
  dropzone.classList.toggle("highlight");
  dropMessage.classList.toggle("hidden");
});

dropzone.addEventListener("dragleave", e => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter--;
  if (dragCounter < 1) {
    dropzone.classList.toggle("highlight");
    dropMessage.classList.toggle("hidden");
  }
});

dropzone.addEventListener("dragover", e => {
  e.preventDefault();
  e.stopPropagation();
});

const originalCanvas = document.querySelector("#original");
const loopCanvas = document.querySelector("#loop");

const originalTrouper = new LooperTrouper(
  originalCanvas,
  originalCanvas.width,
  originalCanvas.height
);
const loopTrouper = new LooperTrouper(
  loopCanvas,
  loopCanvas.width,
  loopCanvas.height,
  true
);

//==============================================================
originalPlayPauseButton.addEventListener("click", e => {
  originalTrouper.playPause();
  turnOffDiodes(diodes);
  if (originalTrouper.isPlaying()) {
    orgPlayDiode.classList.add("glowing");
  }

  if (loopTrouper.isPlaying()) loopTrouper.pause();
});

originalForward.addEventListener("click", e => {
  originalTrouper.forwardFive();
});

originalBack.addEventListener("click", e => {
  originalTrouper.backFive();
});

//==============================================================
loopPlayPauseButton.addEventListener("click", e => {
  loopTrouper.playPause();
  if (originalTrouper.isPlaying()) originalTrouper.pause();
});

loopForward.addEventListener("click", e => {
  loopTrouper.forwardFive();
});

loopBack.addEventListener("click", e => {
  loopTrouper.backFive();
});
//==============================================================

createLoop.addEventListener("click", e => {
  const loop = originalTrouper.suggestLoop(12);
  const buffer = originalTrouper.exportLoop(loop.start, loop.end);
  originalTrouper.pause();
  loopTrouper.setAudioBuffer(buffer);
  loopTrouper.loadBuffer(buffer);
});
