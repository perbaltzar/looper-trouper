const dropIn = document.querySelector('.drop-in');
const dropInButton = document.querySelector('.drop-in-button');

dropInButton.addEventListener('click', e => {
  e.preventDefault();
  dropIn.classList.toggle('active');
});
