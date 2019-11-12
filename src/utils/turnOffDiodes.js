const turnOffDiodes = diodes => {
  diodes.forEach(diode => {
    if (diode.classList.contains('glowing')) diode.classList.remove('glowing');
  });
};

export default turnOffDiodes;
