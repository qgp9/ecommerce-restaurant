function init() {
  const loader = document.querySelector(".loader");
  const main = document.querySelector(".main");

  setTimeout(() => {
    loader.style.opacity = 0;
    loader.style.display = "none";

    main.style.display = "block";
    setTimeout(() => (main.style.opacity = 1), 50);
  }, 2000);
}

init();

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
