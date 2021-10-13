let spinnerWrapper = document.querySelector(".spinner-wrapper");

window.addEventListener("load", function () {
  spinnerWrapper.parentElement.removeChild(spinnerWrapper);
  setAjaxForm();
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

function showModalReservationLoading() {
  return Swal.fire({
    title: 'Processing a reservation',
    text: 'Please wait for few seconds',
    didOpen: () => {
      Swal.showLoading();
    }
  })
}

function showModalReservationError() {
  return Swal.fire({
    title: 'Something Wrong',
    text: 'Please contact admin... TODO',
    icon: 'error'
  })
}

function showModalReservatoinSuccess() {
    return Swal.fire({
      title: 'Thank you for <br/>making a reservation.',
      icon: 'success',
      html:`
        <div>
          <p>Please note that we will hold your table for <br/><strong>15 minutes</strong> from the time of your booking.</p>
          <br/>
          <p>If you are running more than 15 minutes late on the day, 
              please give us a call and we will do everything we can to accommodate you.</p>
          <br/>
          <p>Please do not hesitate to contact us at <strong>(+358)050-3445562</strong>
          <br/>
          if you have any questions about your reservation 
            or if you have any special needs.</p>
        </div>`
    });
    return false;
}

function setAjaxForm() {
  const form = document.getElementById('reservation-form');
  form.addEventListener('submit', event => {
    console.log(event)
    const loading = showModalReservationLoading();
    fetch('/.netlify/functions/form-handler', {
      method: 'POST',
      body: new FormData(event.target)
    })
    .then(res => {
      console.log('status', res.status)
      loading.close();
      if (res.status === 200)
        showModalReservatoinSuccess();
      else
        showModalReservationError();
    })
    event.preventDefault();
  });
}