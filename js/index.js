var languages = {
  en: {
    name: "yachaejeon -- 8",
    ingre: "carrot, zucchini, onion",
  },
  fi: {
    name: "finnish -- 9",
    ingre: "finnish",
  },
};

(function () {
  var currentLanguage;
  var isButtonBlocked = false;
  var section = document.querySelector("li.menu-starter");
  var updateLayout = function () {
    isButtonBlocked = true;
    currentLanguage = section.getAttribute("lang").toLowerCase();
    section.classList.add(
      currentLanguage === "fi" ? "section-anim-rtl" : "section-anim"
    );

    if (!languages[currentLanguage]) {
      console.warn(currentLanguage + ": this language is not supported.");
      currentLanguage = "en";
    }

    var fields = section.querySelectorAll("[data-detect]");
    fields.forEach(function (el) {
      const type = el.getAttribute("data-detect");

      if (!languages[currentLanguage][type]) {
        console.warn("Error: Field with type '" + type + "' is not supported.");
        return;
      }

      el.textContent = languages[currentLanguage][type];
    });
    setTimeout(function () {
      section.classList.remove("section-anim");
      section.classList.remove("section-anim-rtl");
      isButtonBlocked = false;
    }, 500);
  };

  var changeBtn = document.querySelector("button.change-language");
  changeBtn.onclick = function () {
    if (isButtonBlocked) {
      return;
    }

    if (currentLanguage === "en") {
      section.setAttribute("lang", "fi");
      section.style.direction = "rtl";
      updateLayout();
      return;
    }
    section.setAttribute("lang", "en");
    section.style.direction = "ltr";
    updateLayout();
  };
  section.style.display = "block";
  updateLayout();
})();
