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
  "timeOut": "10000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};

const dodajUKorpu = (id_artikla) => {
  $.post("/artikal/korpa/dodaj",
    {
      id_artikla: id_artikla,
    },
    function (data, status) {
      if (status) {
        toastr["success"]("Artikal uspješno dodat u korpu!", "Korpa");
      }
      else {
        toastr["error"]("Problem sa dodavanjem artikla u korpu!", "Korpa");
      }

    });
}