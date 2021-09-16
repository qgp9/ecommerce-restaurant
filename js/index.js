let multiLanguage = {
  en: { id: 1, name: "yachaejeon -- 8", ingre: "carrot, zucchini, onion" },
  fi: { id: 5, name: "finnish -- 9", ingre: "finnish" },
};

window.onload = () => {
  let enBtn = document.getElementById("enBtn");
  let fiBtn = document.getElementById("fiBtn");

  let setLanguage = (lang) => {
    let changeNodeList = Array.prototype.slice.call(
      document.querySelectorAll("[data-detect]")
    );

    //각 dataset 중 detect인 요소들을 찾아 변경하는 곳
    changeNodeList.map((v) => {
      v.textContent = multiLanguage[lang][v.dataset.detect];
    });
  };

  enBtn.addEventListener("click", () => {
    setLanguage(enBtn.dataset.lang);
  });

  fiBtn.addEventListener("click", () => {
    setLanguage(fiBtn.dataset.lang);
  });
};
