const dropIn = document.querySelector('.drop-in');
const dropInButton = document.querySelector('.drop-in-button');
const arrowIcon = document.querySelector('.arrow-icon');

dropInButton.addEventListener('click', e => {
  e.preventDefault();
  dropIn.classList.toggle('active');
  arrowIcon.classList.toggle('rotate');
});
