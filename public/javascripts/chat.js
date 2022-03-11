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

let chat_id;
let room_id;
let sagovornik;

function getCookieData(name) {
  var pairs = document.cookie.split("; "),
    count = pairs.length, parts;
  while (count--) {
    parts = pairs[count].split("=");
    if (parts[0] === name)
      return parts[1];
  }
  return false;
}

const authToken = getCookieData("authToken");

//console.log(authToken);

const socket = io.connect('http://localhost:3000', {
  query: { authToken }
});

socket.on('primi_poruku', function (poruka) {
  console.log("poruka dosla");
  let tmp_html = generisiPorukuLijevo(poruka);
  $('#poruke').append(tmp_html);
});

const posaljiPoruku = () => {
  console.log("Salji")
  let sadrzaj = $('#sadrzajPoruke').val();
  poruka = {};
  if (sadrzaj && sadrzaj.length != 0) {
    poruka.tekst_poruke = sadrzaj;
    poruka.room_id = room_id;
    poruka.sagovornik = sagovornik;
    console.log(poruka);
    socket.emit('nova_poruka', poruka);
  }

  $('#poruke').append(generisiPorukuDesno(poruka));
  $('#sadrzajPoruke').val("");
}

const pridruziSeSobi = (room_id) => {
  socket.emit('dodajUSobu', room_id);

}

//-----------------

const generisiPorukuDesno = (poruka) => {
  let sadrzaj = `<div class="ms-auto my-2 text-white list-group-item list-group-item-success"
                      style="background-color: #736ac5; border-radius: 10px; display: block; max-width: 80%; right:0">
                      <p class="ms-auto" style="max-width: 100%">${poruka.tekst_poruke}</p>
                      <p class="text-end">11:00</p>
                    </div>`;
  return sadrzaj;
}

const generisiPorukuLijevo = (poruka) => {
  let sadrzaj = `<div class="my-4 text-white list-group-item list-group-item-success"
                      style="background-color: #71aaa7; border-radius: 10px; display: block; max-width: 80%; right:0">
                      <p class="ms-auto" style="max-width: 100%">${poruka.tekst_poruke}</p>
                      <p >11:00</p>
                    </div>`;
  return sadrzaj;
}

// klikom na neki od postojecih chatova prikazuje poruke s tim korisnikom
// novi_chat = true ako korisnik nije nikad komunicirao s tim profilom
const otvoriChatSa = (korisnik_id) => {
  $('#poruke').html("");
  $.get("/chat/" + korisnik_id, function (data, status) {
    console.log(data.korisnik_id);
    console.log("-------");

    if (status) {
      room_id = data.room_id;

      for (let i = 0; i < data.result.length; i++) {
        let tmp_html;
        console.log(data.result[i].c_od);
        if (data.result[i].c_od == data.korisnik_id) {
          //console.log("desno")
          generisiPorukuLijevo
          tmp_html = generisiPorukuLijevo(data.result[i]);
        }
        else {
          //console.log("lijevo")
          tmp_html = generisiPorukuDesno(data.result[i]);
        }
        $('#poruke').append(tmp_html);
      }
      chat_id = data.korisnik_id;
      sagovornik = data.korisnik_id;
      $('#inputZaPoruku').show();
    }
  });

}

// kad se ruta /chat ucita saljemo zahtjev na rutu /chat/aktivnost koja vraca listu postojecih chatova ujedno sa njihovim room_id, onda preko socketa dodajemo korisnika u svaku od tih soba
$(function () {
  console.log("ready!");

  $.get("/chat/aktivnost", function (data, status) {
    $('#aktivnost').html("");
    $('#inputZaPoruku').hide();
    if (status) {
      console.log(data);
      for (let i = 0; i < data.profili.length; i++) {
        let tmp_html = `<button class="tablinks border" onclick="otvoriChatSa('${data.profili[i].id}')"
        id = "${data.profili[i].id}" type = "button" >
         ${data.profili[i].ime + " " + data.profili[i].prezime}
          </button >`;

        $('#aktivnost').append(tmp_html);
        pridruziSeSobi(data.profili[i].c_room_id);
      }

      let otvoriChat = $('#otvoriChat').attr("novi_chat");
      try {
        console.log("try")
        if (otvoriChat !== "-1" && $('#' + otvoriChat).length != 0) {
          $('#' + otvoriChat).click();
          console.log('#' + otvoriChat)
        }
        else if (otvoriChat !== "-1") {
          console.log("else")
          let tmp_html = `<button class="tablinks border" onclick="otvoriChatSa('${otvoriChat}')"
        id = "${otvoriChat}" type = "button" >
         ${"Nova" + " " + "poruka"}</button >`;

          $('#aktivnost').append(tmp_html);
          console.log("Otvaranje")
          console.log(otvoriChat);
          $('#' + otvoriChat).click();
          otvoriChat = -1;
        }
      }
      catch (error) {
        console.log(error);
      }

      window.history.pushState({}, "", "http://localhost:3000/chat");
    }
  });




});