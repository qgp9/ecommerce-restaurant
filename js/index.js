let spinnerWrapper = document.querySelector(".spinner-wrapper");

window.addEventListener("load", function () {
  // spinnerWrapper.style.display = 'none';
  spinnerWrapper.parentElement.removeChild(spinnerWrapper);
});

function setLanguageEn() {
  const en = document.getElementById("en");
  const fi = document.getElementById("fi");
  en.style.display = "block";
  fi.style.display = "none";
}

function setLanguageFi() {
  const en = document.getElementById("en");
  const fi = document.getElementById("fi");
  fi.style.display = "block";
  en.style.display = "none";
}
