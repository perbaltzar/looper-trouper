import validateFile from './functions/validateFile.js';

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

export default dropzone;
