const getReadableTime = time => {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60);
  if (seconds < 10) seconds = `0${seconds}`;
  console.log(minutes, seconds);
  return `${minutes}:${seconds}`;
};

export default getReadableTime;
