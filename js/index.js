function myFunction() {
  var en = document.getElementById("en");
  var fi = document.getElementById("fi");
  if (en.style.display === "block") {
    en.style.display = "block";
  } else {
    en.style.display = "block";
    fi.style.display = "none";
  }
}

function myFunctionfi() {
  var en = document.getElementById("en");
  var fi = document.getElementById("fi");
  if (fi.style.display === "none") {
    fi.style.display = "block";
    en.style.display = "none";
  } else {
    fi.style.display = "none";
    en.style.display = "block";
  }
}
