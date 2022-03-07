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


const dodajUKorpu = (id_artikla) => {
  console.log("proba 1");
  $.ajax({
    type: "POST",
    url: "/artikal/korpa/dodaj",
    data: {
      id_artikla: id_artikla,
      kolicina: $('#kolicina_korpa').val(),
    },

    success: function (result) {
      console.log("Uspjeh")
      toastr["success"]("Artikal uspješno dodat u korpu!", "Korpa");
      let tmp_broj_narudzbi = $('#brojArtikalaKorpa').text();
      $('#brojArtikalaKorpa').text(parseInt(tmp_broj_narudzbi) + 1);
    },
    error: function (result) {
      console.log("greska")
      toastr["error"]("Problem sa dodavanjem artikla u korpu!", "Korpa");
    }
  });

}

const izbrisiIzKorpe = (id_korpe) => {
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

const zakljuciNarudzbu = (id_korpe) => {

  $.ajax({
    type: "POST",
    url: "/artikal/korpa/naruci",
    data: {
      id_korpe: id_korpe,
    },

    success: function (result) {
      console.log("Uspjeh")
      toastr["success"]("Artikal uspješno naručen!", "Korpa");
    },
    error: function (result) {
      console.log("Fail")
      toastr["error"]("Greška sa naručivanjem artikla!", "Korpa");
    }
  });

}


const otkaziNarudzbu = (id_narudzbe) => {

  $.ajax({
    type: "POST",
    url: "/artikal/narudzbe/otkazi",
    data: {
      id_narudzbe: id_narudzbe,
    },
    success: function (result) {
      toastr["success"]("Narudžba uspješno otkazana!", "Narudžba");
      $('#narudzba' + id_narudzbe).text("Otkazano od strane kupca");
    },
    error: function (result) {
      toastr["error"]("Greška sa otkazivanjem narudžbe!", "Narudžba");
    }
  });

}