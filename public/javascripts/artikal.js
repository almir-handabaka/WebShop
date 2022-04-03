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

let ocjena_id_narudzbe;
let ucitane_recenzije = false;

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


const ocijeniNarudzbu = () => {
  const ocijena = $('#ocijenaNarudzbe').val();
  const komentar = $('#komentarNarudzbe').val();
  console.log("RAdi")
  $.ajax({
    type: "POST",
    url: "/artikal/narudzbe/ocijena",
    data: {
      ocijena: ocijena,
      komentar: komentar,
      id_narudzbe: ocjena_id_narudzbe,
    },
    success: function (result) {
      toastr["success"]("Narudžba ocijenjena!", "Narudžba");

    },
    error: function (result) {
      toastr["error"]("Greška sa ocjenjivanjem narudžbe!", "Narudžba");
    }
  });

}

const otvoriRecenzije = (artikal_id) => {
  if (!ucitane_recenzije) {
    $.ajax({
      type: "GET",
      url: "/artikal/narudzbe/recenzije/" + artikal_id,
      success: function (recenzije) {
        ucitane_recenzije = true;
        for (let i = 0; i < recenzije.length; i++) {
          let ocjena_zvijezde = "";

          //<span class="fa fa-star checked"></span>
          //<span class="fa fa-star"></span>

          for (let j = 0; j < recenzije[i].ocjena_kupca; j++) {
            ocjena_zvijezde += `<span class="fa fa-star checked"></span>`;
          }

          for (let j = recenzije[i].ocjena_kupca; j < 5; j++) {
            ocjena_zvijezde += `<span class="fa fa-star"></span>`;
          }


          tmp_html = `<div class="card" style="width: 18rem;">
                      <div class="card-body">
                        <h5 class="card-title">${recenzije[i].ime + " " + recenzije[i].prezime} </h5>
                        <h6 class="card-subtitle mb-2 text-muted">${ocjena_zvijezde}</h6>
                        <p class="card-text">${recenzije[i].komentar_kupca}</p>
                        <h6 class="card-subtitle mb-2 text-muted">${recenzije[i].datum_naruc}</h6>
                      </div>
                  </div>`;

          $('#recenzijeBody').append(tmp_html);
        }


        $('#aktivirajModal').click();
      },
      error: function (result) {

      }
    });
  } else {
    $('#aktivirajModal').click();
  }
}