import validateFileType from './functions/validateFileType';

const dropzone = document.querySelector('.drop-zone');
const dropMessage = document.querySelector('.drop-message');
let dragCounter = 0;
const validateFile = file => {
  if (file.length > 1) {
    window.alert('Please select one file only');
    return false;
  }
  if (!validateFileType(file[0].type)) {
    window.alert('Wrong file type, please select an audio file');
    return false;
  }
  return true;
};

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
