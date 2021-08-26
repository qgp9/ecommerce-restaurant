const hamburger = document.querySelector(".hamburger");
const navList = document.querySelector(".nav-list");
const navBar = document.querySelector(".nav");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navList.classList.toggle("open");
  });
}

//Fix Nav
const navHeight = navBar.getBoundingClientRect().height;

window.addEventListener("scroll", () => {
  const scrollHeight = window.pageYOffset;
  if (scrollHeight > navHeight) {
    navBar.classList.add("fix-nav");
  } else {
    navBar.classList.remove("fix-nav");
  }
});
/*
//Scroll
const links = [...document.querySelectorAll(".nav-link")];

links.map((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const id = e.currentTarget.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    const navHeight = navigation.getBoundingClientRect().height;
    const fix = navigation.classList.contains("fix");
    let position = el.offsetTop - navHeight;

    window.scrollTo({
      left: 0,
      top: position,
    });

    navList.classList.remove("open");
  });
});
*/
//Scroll reveal
const scroll = ScrollReveal({
  distance: "100px",
  duration: 2500,
  reset: true,
});

scroll.reveal(`.menu-link h2 `, {
  origin: "right",
  interval: 100,
});

scroll.reveal(`.contact p, .location p, .hour, iframe`, {
  origin: "top",
  interval: 100,
});

//Pop up
const popup = document.querySelector(".popup");
const closePopup = document.querySelector(".popup-close");

if (popup) {
  closePopup.addEventListener("click", () => {
    popup.classList.add("hide-popup");
  });

  window.addEventListener("load", () => {
    setTimeout(() => {
      popup.classList.remove("hide-popup");
    }, 1000);
  });
}
