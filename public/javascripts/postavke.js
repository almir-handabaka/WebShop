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
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};


const updatujDetalje = () => {
    toastr.options = options;


    const detalji = {
        naziv_trgovine: $("#naziv_trgovine").val(),
        kontakt_telefon: $("#kontakt_tel").val(),
        opis: $("#opis").val(),
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
    if (detalji.naziv_trgovine.length < 3) {
        toastr["error"]("Naziv trgovine mora imati više od 3 ili više slova!", "Greška !");
        return;
    }
    else {
        console.log(detalji);
        $.post("/trgovina/postavke/detalji",
            {
                detalji: JSON.stringify(detalji),
            },
            function (data, status) {
                if (status)
                    toastr["success"]("Uspješno sačuvano!", "Detalji o trgovini");
            });
    }

}

const dodajPoslovnicu = () => {
    toastr.options = options;
    const poslovnica = {
        kanton: $("#kantonSelekt").val(),
        grad: $("#gradSelekt").val(),
        adresa: $("#adresa").val(),
    };

    if (isNaN(poslovnica.kanton) || isNaN(poslovnica.grad)) {
        toastr["error"]("Pogrešan odabir kantona i grada!", "Greška !");
        return;
    }
    else if (poslovnica.adresa.length < 8) {
        toastr["error"]("Adresa je prekratka!", "Greška !");
        return;
    }
    else {

        $.post("/trgovina/postavke/poslovnica",
            {
                poslovnica: JSON.stringify(poslovnica),
            },
            function (data, status) {
                if (status)
                    toastr["success"]("Uspješno sačuvano!", "Nova poslovnica");
            });
    }
}


const ukloniPoslovnicu = (id_poslovnice) => {
    console.log(id_poslovnice);
    toastr.options = options;
    $.post("/trgovina/postavke/poslovnica/delete",
        {
            id_poslovnice: id_poslovnice,
        },
        function (data, status) {
            if (status) {
                toastr["success"]("Uspješno izbrisano!", "Poslovnica");
                $("#poslovnica" + id_poslovnice).hide();
            }
            else {
                toastr["error"]("Greška prilikom brisanja poslovnice!", "Greška !");
            }
        });
}