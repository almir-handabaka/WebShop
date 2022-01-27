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



const dodajUKorpu = (id_artikla) => {
  toastr.options = options;
  $.post("/artikal/korpa/dodaj",
    {
      id_artikla: id_artikla,
      kolicina: $('#kolicina_korpa').val(),
    },
    function (data, status) {
      if (status) {
        toastr["success"]("Artikal uspješno dodat u korpu!", "Korpa");
        let tmp_broj_narudzbi = $('#brojArtikalaKorpa').text();
        $('#brojArtikalaKorpa').text(parseInt(tmp_broj_narudzbi) + 1);
      }
      else {
        toastr["error"]("Problem sa dodavanjem artikla u korpu!", "Korpa");
      }

    });
}

const izbrisiIzKorpe = (id_korpe) => {
  toastr.options = options;
  $.post("/artikal/korpa/izbrisi",
    {
      id_korpe: id_korpe,
    },
    function (data, status) {
      if (status) {
        toastr["success"]("Artikal uspješno izbrisan iz korpe!", "Korpa");
        $('#korpa' + id_korpe).remove();
      }
      else {
        toastr["error"]("Problem sa brisanjem artikla iz korpe!", "Korpa");
      }

    });
}