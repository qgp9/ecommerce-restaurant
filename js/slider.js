// Hero Carousel-index
const slider1 = document.querySelector("#glide_1");
if (slider1) {
  new Glide(slider1, {
    type: "carousel",
    startAt: 0,
    autoplay: 10000,
    gap: 0,
    hoverpause: true,
    perView: 1,
    animationDuration: 2000,
    animationTimingFunc: "linear",
  }).mount();
}
//header-index3
const swiper1 = new Swiper(".slider-1", {
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  loop: true,
  navigation: {
    nextEl: ".swiper-next",
    prevEl: ".swiper-prev",
  },
});
//main-index3
const swiper2 = new Swiper(".slider-2", {
  autoHeight: true,
  effect: "coverflow",
  grabCursor: true,
  loop: true,
  centeredSlides: true,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 40,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  navigation: {
    nextEl: ".custom-next",
    prevEl: ".custom-prev",
  },
  pagination: {
    el: ".custom-pagination",
  },
});
