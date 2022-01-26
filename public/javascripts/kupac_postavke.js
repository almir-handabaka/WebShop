options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "8000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};

const updatujDetalje = () => {
  toastr.options = options;
  const detalji = {
    kontakt_telefon: $("#kontakt_tel").val(),
  };

  var regex = /\d+/g;

  detalji.kontakt_telefon = detalji.kontakt_telefon.match(regex);
  let broj = "";
  for (let i = 0; i < detalji.kontakt_telefon.length; i++) {
    broj += detalji.kontakt_telefon[i];
  }
  detalji.kontakt_telefon = broj;
  if (broj.length < 9) {
    toastr["error"]("Kontakt broj mora imati 9 ili više brojeva!", "Greška !");
    return;
  }
  else {
    //console.log(detalji);
    $.post("/pocetna/postavke/detalji",
      {
        kontakt_telefon: detalji.kontakt_telefon,
      },
      function (data, status) {
        if (status)
          toastr["success"]("Uspješno sačuvano!", "Postavke");
      });
  }

}


const izbrisiInteres = (interes_id) => {
  toastr.options = options;
  $.post("/pocetna/interesi/delete",
    {
      interes_id: interes_id,
    },
    function (data, status) {
      if (status) {
        toastr["success"]("Uspješno izbrisano!", "Postavke");
        $("#int" + interes_id).remove();
      }
      else {
        toastr["error"]("Greška prilikom brisanja interesa!", "Greška !");
      }
    });
}


const uploadProfilnu = () => {
  toastr.options = options;

  var fd = new FormData();
  var files = $('#inputGroupFile04')[0].files;

  if (files.length != 1) {
    toastr["error"]("Moguće je uploadovati samo jednu fotografiju!", "Profilna slika");
    return;
  }

  for (let i = 0; i < files.length; i++) {
    fd.append("avatar", files[i], files[i].name);
  }

  $.ajax({
    url: "/trgovina/profilna",
    type: 'post',
    data: fd,
    contentType: false,
    processData: false,
    success: function (response) {
      if (response) {
        toastr["success"]("Profilna slika uspješno promjenjena!", "Profilna slika");
        $('#inputGroupFile04').val("");

      } else {
        toastr["error"]("Došlo je do greške, pokušajte opet!", "Profilna slika");
      }
    },
  });

}


const promjeniSifru = () => {
  toastr.options = options;
  let nova_sifra = $('#password1').val();
  let ponovljena_sifra = $('#password2').val();

  if (nova_sifra === ponovljena_sifra && nova_sifra != undefined && ponovljena_sifra != undefined && nova_sifra.length >= 5) {
    $.post("/register/promjena_sifre",
      {
        nova_sifra: nova_sifra,
      },
      function (data, status) {
        if (status) {
          toastr["success"]("Nova šifra uspješno promjenjena!", "Šifra");
          window.location = "/login/logout";
        } else {
          toastr["error"]("Došlo je do greške, pokušajte opet!", "Šifra");
        };

      });
  }
  else {
    toastr["error"]("Šifra mora imati 5 ili vise karaktera i oba polja se moraju podudarati!", "Šifra");
  }

}


const posaljiInterese = () => {
  toastr.options = options;
  if (tg_input.value.length === 0) {
    toastr["error"]("Unesite 1 ili više interesa!", "Interesi");
    return;
  }
  $.post("/pocetna/interesi",
    {
      tagovi: JSON.stringify(tg_input.value),
    },
    function (data, status) {
      if (status == 'success') {

        toastr["success"]("Interesi uspješno dodati!", "Interesi");
        for (let i = 0; i < data.length; i++) {
          let tmp_html = `<div class="col-3 mt-2" id="int${data[i].ik_id}">
                                <div class="list-group-item d-flex justify-content-between align-items-start"
                                  id="list-tab" role="tablist">
                                  <div class="ms-2 me-auto">
                                    ${tg_input.value[i].value}
                                  </div>
                                  <span class="badge"><button type="button" class="btn-close" aria-label="Close"
                                      onclick="izbrisiInteres('${data[i].ik_id}')"></button></span>
                                </div>
                              </div>`
          $("#interesi").append(tmp_html);
        }
        tg_input.removeAllTags();
      }
      else {
        console.log("greska kategorije");
        // doslo je do greske
      }

    });
};