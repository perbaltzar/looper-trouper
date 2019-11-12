const turnOffDiodes = diodes => {
  diodes.forEach(diode => {
    if (diode.classList.contains('active')) diode.classList.remove('active');
  });
};

export default turnOffDiodes;
