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

var chat_id;

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

socket.on('primi_poruku', function (info) {
  toastr["success"](info, "Notifikacija");
  console.log(info);
});

const posaljiPoruku = () => {
  console.log("Salji")
  let sadrzaj = $('#sadrzajPoruke').val();
  poruka = {};
  if (sadrzaj && sadrzaj.length != 0) {
    poruka.tekst_poruke = sadrzaj;
    poruka.chat_id = chat_id;
    console.log(poruka);
    socket.emit('nova_poruka', poruka);
  }

  $('#poruke').append(generisiPorukuDesno(poruka));
  $('#sadrzajPoruke').val("");
}



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
                      style="background-color: #71aaa7; border-radius: 10px; display: block; max-width: 75%; right:0">
                      <p class="ms-auto" style="max-width: 100%">${poruka.tekst_poruke}</p>
                      <p>11:00</p>
                    </div>`;
  return sadrzaj;
}

const otvoriChatSa = (korisnik_id) => {
  console.log("Otvaranje");
  $('#poruke').html("");
  $.get("/chat/" + korisnik_id, function (data, status) {
    console.log("Data " + data.korisnik_id);
    if (status) {
      for (let i = 0; i < data.result.length; i++) {
        let tmp_html;
        if (data.result[i].c_od === data.korisnik_id) {
          tmp_html = generisiPorukuDesno(data.result[i]);
        }
        else {
          tmp_html = generisiPorukuLijevo(data.result[i]);
        }
        $('#poruke').append(tmp_html);
      }
    }
  });
  chat_id = korisnik_id;
}