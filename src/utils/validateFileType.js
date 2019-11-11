/**
 * return true if file type is accepted
 * @param file string with file type
 */
const validateFileType = fileType => {
  return (
    fileType === 'audio/mpeg' ||
    fileType === 'audio/wave' ||
    fileType === 'audio/wav' ||
    fileType === 'audio/mp3' ||
    fileType === 'audio/x-aiff'
  );
};

export default validateFileType;
