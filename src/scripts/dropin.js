const dropIn = document.querySelector(".drop-in");
const dropInButton = document.querySelector(".drop-in-button");
const arrowIcon = document.querySelector(".arrow-icon");

dropInButton.addEventListener("click", e => {
  e.preventDefault();
  dropIn.classList.toggle("active");
  arrowIcon.classList.toggle("rotate");
  if (!arrowIcon.classList.contains("drop-in-animation")) {
    arrowIcon.classList.remove("drop-in-animation");
  }
});

dropInButton.addEventListener("mouseover", e => {
  arrowIcon.classList.remove("drop-in-animation");
  if (!dropIn.classList.contains("active")) {
    arrowIcon.classList.add("drop-in-animation");
  }
});

dropInButton.addEventListener("mouseleave", e => {
  arrowIcon.classList.remove("drop-in-animation");
});
