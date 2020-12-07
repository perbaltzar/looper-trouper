require('regenerator-runtime/runtime');
import * as PIXI from 'pixi.js';
import mitt from 'mitt';
import LooperTrouper from './LooperTrouper.js';
import loadFile from './utils/loadFile.js';
import validateFile from './utils/validateFile.js';
import getReadableTime from './utils/getReadableTime';
import turnOffDiodes from './utils/turnOffDiodes';

//============ EMITTER ======= //
const emitter = mitt();

//========== CANVAS =========//
const originalCanvas = document.querySelector('#original');
const loopCanvas = document.querySelector('#loop');

//========== SPEAKER ===========\\
const speakers = document.querySelectorAll('.speaker');

//=========================== SONG INFO =======================//
const songName = document.querySelector('.song-name');
const songDuration = document.querySelector('.song-duration');
const songBpm = document.querySelector('.song-bpm');
const loopStart = document.querySelector('.loop-start');
const loopEnd = document.querySelector('.loop-end');
const loopDuration = document.querySelector('.loop-duration');

//================= EFFECT ============ \\
const lowPassFrequency = document.querySelector('.low-pass-frequency');
const highPassFrequency = document.querySelector('.high-pass-frequency');

// ========== BUTTONS ================//
// original buttons
const originalBackward = document.querySelector('.original-back');
const originalPlayPauseButton = document.querySelector('.original-play-pause');
const originalForward = document.querySelector('.original-forward');
const originalLooping = document.querySelector('.original-looping');
const copyLoopButton = document.querySelector('.original-copy-loop');

// Loop buttons
const loopPlayPauseButton = document.querySelector('.loop-play-pause');
const loopForward = document.querySelector('.loop-forward');
const loopBackward = document.querySelector('.loop-back');
const loopLooping = document.querySelector('.loop-looping');
const loopCopyLoop = document.querySelector('.copy-loop-loop');
const loopSaveLoop = document.querySelector('.save-loop');
const loopDownloadLoop = document.querySelector('.download-button');

// Drop in buttons
const createSmartLoop = document.querySelector('.smart-loop-button');
const resetSong = document.querySelector('.reset-song');
const lowPassSwitch = document.querySelector('.low-pass-button');
const highPassSwitch = document.querySelector('.high-pass-button');
const eqSwitch = document.querySelector('.eq-button');
const volumeSwitch = document.querySelector('.volume-button');

//=========== DIODES =================//
const diodes = document.querySelectorAll('.diode');

// original diodes
const orgPlayDiode = document.querySelector('.org-play-diode');
const orgLoopingDiode = document.querySelector('.original-looping-diode');
const orgForwardDiode = document.querySelector('.original-forward-diode');
const orgBackwardDiode = document.querySelector('.original-backward-diode');

// loop diodes
const loopPlayDiode = document.querySelector('.loop-play-diode');
const loopForwardDiode = document.querySelector('.loop-forward-diode');
const loopBackwardDiode = document.querySelector('.loop-backward-diode');
const loopLoopingDiode = document.querySelector('.loop-looping-diode');

// drop-in diodes
const lowPassDiode = document.querySelector('.low-pass-diode');
const highPassDiode = document.querySelector('.high-pass-diode');
const eqDiode = document.querySelector('.eq-diode');
const volumeDiode = document.querySelector('.volume-diode');

//=========== DROP IN =================
const dropIn = document.querySelector('.drop-in');

//=========== SLIDERS =================//
const lengthSlider = document.querySelector('#length-slider');
const lengthDisplay = document.querySelector('.minimun-length-display');

// eq
const low = document.querySelector('#low');
const lowMid = document.querySelector('#low-mid');
const mid = document.querySelector('#mid');
const highMid = document.querySelector('#high-mid');
const high = document.querySelector('#high');

// filters
const lowPassSlider = document.querySelector('.low-pass-slider');
const highPassSlider = document.querySelector('.high-pass-slider');
const volumeSlider = document.querySelector('.volume-slider');

//=========== DROP ZONE ===============//
const dropzone = document.querySelector('.drop-zone');
const dropMessage = document.querySelector('.drop-message-hover');
const dropMessageIntro = document.querySelector('.drop-message-intro');
const loading = document.querySelector('.drop-loading');

//============== VARIABLES =============//
let dragCounter = 0;
let minimumLoopLength = 5;
let songInformation, loopInformation;

//=========== LOOPER TROUPER ===========//
const originalTrouper = new LooperTrouper(
  originalCanvas,
  originalCanvas.width,
  originalCanvas.height,
  false,
  emitter,
);
const loopTrouper = new LooperTrouper(
  loopCanvas,
  loopCanvas.width,
  loopCanvas.height,
  true,
  emitter,
);

const resetInformation = () => {
  songName.innerText = `Name:`;
  songBpm.innerText = `Bpm:`;
  songDuration.innerText = `Duration:`;
  loopStart.innerText = `Start:`;
  loopEnd.innerText = `End: `;
  loopDuration.innerText = `Duration: `;
};

//================= EMITTER EVENTS ============//
emitter.on('loaded', () => {
  songInformation = originalTrouper.getFileInformation();
  loopInformation = loopTrouper.getFileInformation();
  songName.innerText = `Name: ${songInformation.name}`;
  songBpm.innerText = `Bpm: ${songInformation.bpm}`;
  songDuration.innerText = `Duration: ${getReadableTime(songInformation.duration)}`;
  loopInformation.loop = originalTrouper.getLoopPosition();
  loopStart.innerText = `Start: ${getReadableTime(loopInformation.loop.start)}`;
  loopEnd.innerText = `End: ${getReadableTime(loopInformation.loop.end)}`;
  loopDuration.innerText = `Duration: ${getReadableTime(
    loopInformation.loop.end - loopInformation.loop.start,
  )} `;
  loading.classList.add('hidden');
});

//================== DROP ZONE ==================//
dropzone.addEventListener(
  'drop',
  e => {
    loading.classList.remove('hidden');
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files;
    if (validateFile(file)) {
      URL.createObjectURL(file[0]);
      dragCounter = 0;
      dropzone.classList.toggle('hidden');
      dropMessage.classList.add('hidden');
      originalTrouper.loadAudio(URL.createObjectURL(file[0]));      
      originalTrouper.setFileInformation(file[0].name, file[0].size);
    }
  },
  false,
);

dropzone.addEventListener('dragenter', e => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter++;
  dropMessage.classList.toggle('hidden');
  dropMessageIntro.classList.toggle('hidden');
});

dropzone.addEventListener('dragleave', e => {
  e.preventDefault();
  e.stopPropagation();
  dragCounter--;
  if (dragCounter < 1) {
    dropMessage.classList.toggle('hidden');
    dropMessageIntro.classList.toggle('hidden');
  }
});

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  e.stopPropagation();
});

//============================ ORIGINAL CONTROLLER =================================
originalPlayPauseButton.addEventListener('click', e => {
  originalTrouper.playPause();
  if (originalTrouper.isPlaying()) {
    // Play the speakers
    const animationTime = 60 / songInformation.bpm;
    speakers.forEach(speaker => {
      speaker.style.animation = `play ${animationTime}s infinite`;
    });
    orgPlayDiode.classList.add('glowing');
  } else {
    speakers.forEach(speaker => {
      speaker.style.animation = ``;
    });
    orgPlayDiode.classList.remove('glowing');
  }

  if (loopTrouper.isPlaying()) {
    loopPlayDiode.classList.remove('glowing');
    loopTrouper.pause();
  }
});

originalForward.addEventListener('mousedown', e => {
  originalTrouper.forwardFive();
  orgForwardDiode.classList.add('glowing');
  // originalTrouper.fastForward();
});
originalForward.addEventListener('mouseup', e => {
  orgForwardDiode.classList.remove('glowing');
});

originalBackward.addEventListener('mousedown', e => {
  originalTrouper.backFive();
  orgBackwardDiode.classList.add('glowing');
  // originalTrouper.fastForward();
});
originalBackward.addEventListener('mouseup', e => {
  orgBackwardDiode.classList.remove('glowing');
});

originalLooping.addEventListener('click', e => {
  orgLoopingDiode.classList.toggle('glowing');
  originalTrouper.toogleLoop();
});

copyLoopButton.addEventListener('click', e => {
  if (originalTrouper.hasLoop()) {
    speakers.forEach(speaker => {
      speaker.style.animation = ``;
    });
    const copyLoop = originalTrouper.getLoopPosition();
    const buffer = originalTrouper.exportLoop(copyLoop.start, copyLoop.end);
    originalTrouper.pause();
    orgPlayDiode.classList.remove('glowing');
    loopPlayDiode.classList.remove('glowing');
    loopTrouper.setAudioBuffer(buffer);
    loopTrouper.loadBuffer(buffer);
    loopTrouper.setFileInformation(originalTrouper.name, originalTrouper.size);
  }
});

//============================== LOOP CONTROLLERS ================================
loopPlayPauseButton.addEventListener('click', e => {
  loopTrouper.playPause();
  if (loopTrouper.isPlaying()) {
    loopPlayDiode.classList.add('glowing');
    const animationTime = 60 / songInformation.bpm;
    speakers.forEach(speaker => {
      speaker.style.animation = `play ${animationTime}s infinite`;
    });
  } else {
    speakers.forEach(speaker => {
      speaker.style.animation = ``;
    });
    loopPlayDiode.classList.remove('glowing');
  }
  if (originalTrouper.isPlaying()) {
    originalTrouper.pause();
    orgPlayDiode.classList.remove('glowing');
  }
});

loopForward.addEventListener('mousedown', e => {
  loopTrouper.forwardFive();
  loopForwardDiode.classList.add('glowing');
  // loopTrouper.fastForward();
});
loopForward.addEventListener('mouseup', e => {
  loopForwardDiode.classList.remove('glowing');
});

loopBackward.addEventListener('mousedown', e => {
  loopTrouper.backFive();
  loopBackwardDiode.classList.add('glowing');
});
loopBackward.addEventListener('mouseup', e => {
  loopBackwardDiode.classList.remove('glowing');
});

loopLooping.addEventListener('click', e => {
  loopLoopingDiode.classList.toggle('glowing');
  loopTrouper.toogleLoop();
});

loopCopyLoop.addEventListener('click', e => {
  if (loopTrouper.hasLoop()) {
    speakers.forEach(speaker => {
      speaker.style.animation = ``;
    });
    const copyLoop = loopTrouper.getLoopPosition();
    const buffer = loopTrouper.exportLoop(copyLoop.start, copyLoop.end);
    loopTrouper.pause();
    originalTrouper.pause();
    orgPlayDiode.classList.remove('glowing');
    loopPlayDiode.classList.remove('glowing');
    loopTrouper.setAudioBuffer(buffer);
    loopTrouper.loadBuffer(buffer);
    loopTrouper.setFileInformation(originalTrouper.name, originalTrouper.size);
  }
});

//========================= EXPORT LOOP =====================================

createSmartLoop.addEventListener('click', e => {
  speakers.forEach(speaker => {
    speaker.style.animation = ``;
  });
  const loop = originalTrouper.suggestLoop(minimumLoopLength);
  const buffer = originalTrouper.exportLoop(loop.start, loop.end);
  originalTrouper.pause();
  orgPlayDiode.classList.remove('glowing');
  loopPlayDiode.classList.remove('glowing');
  loopTrouper.setAudioBuffer(buffer);
  loopTrouper.loadBuffer(buffer);  
  loopTrouper.setFileInformation(originalTrouper.name, originalTrouper.size)
});

lengthSlider.addEventListener('input', e => {
  lengthSlider.max = originalTrouper.getDuration();
  minimumLoopLength = e.target.value;
  lengthDisplay.innerText = `Length: ${minimumLoopLength} seconds`;
});

//========================= RESET SONG ============================\\
resetSong.addEventListener('click', e => {
  speakers.forEach(speaker => {
    speaker.style.animation = ``;
  });
  dropzone.classList.remove('hidden');
  originalTrouper.reset();
  loopTrouper.reset();
  dropIn.classList.remove('active');
  dropMessageIntro.classList.remove('hidden');
  resetInformation();
  turnOffDiodes(diodes);
});

//======================== EQ =========================\\
eqSwitch.addEventListener('click', e => {
  loopTrouper.toggleEq();
  eqDiode.classList.toggle('glowing');
});

low.addEventListener('input', e => {
  loopTrouper.setLowGain(-e.target.value);
});
lowMid.addEventListener('input', e => {
  loopTrouper.setLowMidGain(-e.target.value);
});
mid.addEventListener('input', e => {
  loopTrouper.setMidGain(-e.target.value);
});
highMid.addEventListener('input', e => {
  loopTrouper.setHighMidGain(-e.target.value);
});
high.addEventListener('input', e => {
  loopTrouper.setHighGain(-e.target.value);
});

//======================== LOW PASS =========================\\
lowPassSwitch.addEventListener('click', e => {
  loopTrouper.toggleLowPass();
  lowPassDiode.classList.toggle('glowing');
});

lowPassSlider.addEventListener('input', e => {
  lowPassFrequency.innerText = `Frequenzy: ${e.target.value}`;
  loopTrouper.setLowPassFrequency(e.target.value);
});

//======================== High PASS =========================\\
highPassSwitch.addEventListener('click', e => {
  loopTrouper.toggleHighPass();
  highPassDiode.classList.toggle('glowing');
});
highPassSlider.addEventListener('input', e => {
  highPassFrequency.innerText = `Frequenzy: ${e.target.value}`;
  loopTrouper.setHighPassFrequency(e.target.value);
});

//================== VOLUME =========================\\

volumeSwitch.addEventListener('click', e => {
  originalTrouper.toggleVolume();
  loopTrouper.toggleVolume();
  volumeDiode.classList.toggle('glowing');
});
volumeSlider.addEventListener('input', e => {
  const gain = e.target.value / 100;
  originalTrouper.setVolume(gain);
  loopTrouper.setVolume(gain);
});

//================== SAVE TO COMPUTER =========================\\
loopSaveLoop.addEventListener('click', async e => {
  const downloadData = loopTrouper.createDownload()
  
  loopDownloadLoop.style.display = 'block'
  loopDownloadLoop.download = downloadData.name;
  loopDownloadLoop.href = downloadData.href;
})