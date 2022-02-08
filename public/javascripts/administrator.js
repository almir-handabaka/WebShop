let options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "10000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};

toastr.options = options;

const blokirajKorisnika = (novi_status, korisnik_id) => {
  $.post("/admin/blokiraj",
    {
      novi_status: novi_status,
      korisnik_id: korisnik_id,
    },
    function (data, status) {
      if (status) {
        if (novi_status === 1) {
          toastr["success"]("Korisnik uspješno unbanovan!", "Administrator");
          $("#statusProfila" + korisnik_id).text("Aktivan");
        } else {
          toastr["success"]("Korisnik uspješno blokiran!", "Administrator");
          if (novi_status === 2) {
            $("#statusProfila" + korisnik_id).text("Permanent ban");
          }
          else {
            $("#statusProfila" + korisnik_id).text("Temporary ban - 15 dana");
          }

        }

      }

    });
}

const posaljiPorukuSvima = () => {
  let sadrzaj_poruke = $('#sadrzajPoruke').val();
  if (sadrzaj_poruke && sadrzaj_poruke.length != 0) {
    $.post("/admin/poruka",
      {
        poruka: sadrzaj_poruke,
      },
      function (data, status) {
        if (status) {
          toastr["success"]("Poruka uspješno poslata svim korisnicima!", "Masovna poruka");
          $('#sadrzajPoruke').val("");
          $('.btn-close').trigger('click');
        }
        else {
          toastr["error"]("Iz nekog razloga poruka nije poslata!", "Masovna poruka");
        }

      });
  }

}


const dodajKategoriju = () => {
  let novaKategorija = $('#novaKategorija').val();
  if (novaKategorija && novaKategorija.length != 0) {
    $.post("/admin/lookup/nova_kategorija",
      {
        novaKategorija: novaKategorija,
      },
      function (data, status) {
        if (status) {
          //console.log(data);
          toastr["success"]("Kategorija sačuvana!", "Kategorija");
          $('#novaKategorija').val("");
          $('#kategorije').append(` <div class="col-3 mt-2" id="kategorija${data.id_kategorije}">
                            <div class="list-group position-relative" id="list-tab" role="tablist">
                              <a class="list-group-item list-group-item-action p-4 text-center text-wrap fw-bold"
                                id="list-home-list" data-toggle="list"
                                href="" role="tab"
                                aria-controls="home">
                                
                                ${data.naziv_kategorije}
                              </a>
                              <button type="button"
                                class="btn-close position-absolute top-0 start-100 translate-middle p-2  border border-light rounded-circle"
                                aria-label="Close" style="left:80%"
                                onclick="ukloniKategoriju('${data.id_kategorije}')"></button>
                            </div>

                          </div>`);
        }
        else {
          toastr["error"]("Kategorija nije sačuvana!", "Kategorija");
        }

      });
  }
}

const ukloniKategoriju = (id_kategorije) => {
  $.post("/admin/lookup/ukloni_kategoriju",
    {
      id_kategorije: id_kategorije,
    },
    function (data, status) {
      if (status) {
        toastr["success"]("Kategorija izbrisana!", "Kategorija");
        $('#kategorija' + id_kategorije).remove();
      }
      else {
        toastr["error"]("Kategorija nije izbrisana!", "Kategorija");
      }

    });
}

const izbrisiGrad = (id_grada) => {
  $.post("/admin/lookup/ukloni_grad",
    {
      id_grada: id_grada,
    },
    function (data, status) {
      if (status) {
        toastr["success"]("Grad izbrisan!", "Grad");
        $('#grad' + id_kategorije).remove();
      }
      else {
        toastr["error"]("Grad nije izbrisan!", "Grad");
      }

    });
}