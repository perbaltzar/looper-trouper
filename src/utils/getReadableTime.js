const getReadableTime = time => {
  let seconds = Math.floor(time % 60);
  let minutes = Math.floor(time / 60);
  if (seconds < 10) seconds = `0${seconds}`;
  return `${minutes}:${seconds}`;
};

export default getReadableTime;
