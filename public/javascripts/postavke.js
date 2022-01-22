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
                if (status) {
                    toastr["success"]("Uspješno sačuvano!", "Nova poslovnica");
                    let broj = $("#poslovnice").children().length;
                    let tmp_html = `<tr id="poslovnica${data.id_lokacije}">
                                                                    <th scope="row">
                                                                        ${broj + 1}
                                                                    </th>
                                                                    <td>
                                                                        ${$("#kantonSelekt option:selected").text()}
                                                                    </td>
                                                                    <td>
                                                                        ${$("#gradSelekt option:selected").text()}
                                                                    </td>
                                                                    <td>
                                                                        ${$("#adresa").val()}
                                                                    </td>
                                                                    <td><button type="button"
                                                                            onclick="ukloniPoslovnicu('${data.id_lokacije}')"
                                                                            class="btn-close btn-danger"
                                                                            aria-label="Close"></button></td>
                                                                </tr>`;
                    $("#poslovnice").append(tmp_html);

                }

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
                $("#poslovnica" + id_poslovnice).remove();
            }
            else {
                toastr["error"]("Greška prilikom brisanja poslovnice!", "Greška !");
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
                toastr["success"]("Profilna slika promjenjena!", "Profilna slika");
                $('#inputGroupFile04').val("");
            } else {
                toastr["error"]("Došlo je do greške, pokušajte opet!", "Profilna slika");
            }
        },
    });

}


const promjeniSifru = () => {
    toastr.options = options;
    console.log("promjena sifre");
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