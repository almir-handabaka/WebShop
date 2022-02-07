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

socket.on('pocetak', function (info) {
  toastr["success"](info, "Notifikacija");
  console.log(info);
});