const interleave = (L, R) => {
  const length = L.length + R.length;
  const stereo = new Float32Array(length);

  let index = 0;

  for (let i = 0; i < length; i++) {
    stereo[index++] = L[i];
    stereo[index++] = R[i];
    index++;
  }
  return stereo;
};

export default interleave;
