import validateFileType from './validateFileType';
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

export default validateFile;
