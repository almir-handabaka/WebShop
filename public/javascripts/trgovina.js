var kategorije;
var lokacije;
var t_lokacija;
var id_artikla = 0;
var dohvaceneFotografije = false;



const srediModal = (artikal, naslov_modala, akcija) => {
    if (akcija === 'edit') {
        artikal = JSON.parse(artikal);
    }

    if (kategorije === undefined) {
        dohvatiKategorije();
    }
    if (lokacije === undefined) {
        dohvatiLokacije();
    }

    //console.log(akcija);
    $("#exampleModalLabel").text(naslov_modala);
    $("#sacuvajDugme").attr("onclick", "dodajArtikal('" + akcija + "')");

    if (akcija === 'edit') {
        $("#naziv").val(artikal.naziv_artikla);
        $("#cijena").val(artikal.cijena);
        $("#kolicina").val(artikal.kolicina);
        $("#stanje").val(artikal.stanje);
        $("#kategorija").val(artikal.id_kategorije);
        $("#lokacija").val(artikal.id);
        $("#opis").val(artikal.opis_artikla);
        $('#inputGroupFile01').val("");
        t_lokacija = artikal.id;
        id_artikla = artikal.id_artikla;
        $('#uplFotografije').html("");
        $('#accordionExample').show();
        if ($('.accordion-button').attr("aria-expanded") === "true") {
            $('.accordion-button').click();
        }
        tg_input.removeAllTags();


    }
    else {
        $("#naziv").val("");
        $("#cijena").val("");
        $("#kolicina").val(1);
        $("#stanje").val(1);
        $("#kategorija").val(9);
        $("#lokacija").val(1);
        $("#opis").val("");
        $('#inputGroupFile01').val("");
        $('#accordionExample').hide();
        $('#uplFotografije').html("");
        tg_input.removeAllTags();
        t_lokacija = 1;
    }
    dohvaceneFotografije = false;
    //$("#recipient-name").val(naziv);
}


const dohvatiKategorije = () => {
    $.get("/trgovina/kategorije",
        function (data, status) {
            if (status == 'success') {
                kategorije = data;
                //console.log(data);
                for (let i = 0; i < kategorije.length; i++) {
                    $("#kategorija").append(`<option value = ${kategorije[i].id_kategorije}>${kategorije[i].naziv_kategorije}</option>`);
                }
            }
            else {
                console.log("greska kategorije");
                // doslo je do greske
            }

        });
}

const dohvatiLokacije = () => {
    $.get("/trgovina/poslovnice",
        function (data, status) {
            if (status == 'success') {
                lokacije = data;
                //console.log(data);
                for (let i = 0; i < lokacije.length; i++) {
                    $("#lokacija").append(`<option value = ${lokacije[i].id_lokacije}>${lokacije[i].adresa_poslovnice}</option>`);
                }
                $("#lokacija").val(lokacije[0].id_lokacije);
            }
            else {
                console.log("greska lokacije");
                // doslo je do greske
            }

        });
}


// funkcija dodaje/uredjuje artikal
const dodajArtikal = (akcija) => {

    let ruta = "/trgovina/dodaj_artikal";
    if (akcija === 'edit') {
        ruta = "/trgovina/uredi_artikal";
    }

    var fd = new FormData();
    var files = $('#inputGroupFile01')[0].files;

    for (let i = 0; i < files.length; i++) {
        fd.append("file", files[i], files[i].name);
    }

    let tmp = [];

    let data = {
        naziv: $("#naziv").val(),
        cijena: $("#cijena").val(),
        kolicina: $("#kolicina").val(),
        stanje: $("#stanje").val(),
        kategorija: $("#kategorija").val(),
        lokacija: $("#lokacija").val(),
        opis: $("#opis").val(),
        id_artikla: id_artikla,
        tagovi: JSON.stringify(tg_input.value),
    };
    console.log(tmp);

    for (const property in data) {
        fd.append(property.toString(), data[property]);
    }


    $.ajax({
        url: ruta,
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response != 0) {
                console.log("Okej upload");
            } else {
                alert('file not uploaded');
            }
        },
    });



    /* $.post(ruta,
        fd,
        {
            naziv: $("#naziv").val(),
            cijena: $("#cijena").val(),
            kolicina: $("#kolicina").val(),
            stanje: $("#stanje").val(),
            kategorija: $("#kategorija").val(),
            lokacija: $("#lokacija").val(),
            opis: $("#opis").val(),
            id_artikla: id_artikla,
            slike: fileUpload,
        },

        function (data, status) {

            if (status == 'success') {
                srediModal('', 'Dodaj artikal', 'dodaj')
                // ispisi da je uspjesno dodat artikal
            }
            else {
                console.log("Greska");
                // doslo je do greske
            }

        }); */
}

const dohvatiFotografije = () => {
    if (!dohvaceneFotografije)
        $.get("/trgovina/fotografije/" + id_artikla,
            function (data, status) {
                for (let i = 0; i < data.length; i++) {
                    $("#uplFotografije").append(`<div id="ft${data[i].id}" class="col-3 mt-1 position-relative"><button type="button" class="btn-close position-absolute" style="right:25px;" aria-label="Close" onclick="izbrisiFotografiju(${data[i].id})"></button>
                    <img  src="data/uploads/${data[i].naziv_fotografije}" alt="Sorry! Image not available at this time" class="w-100" />
                    </div>`);
                }
            });
    dohvaceneFotografije = true;
}

const izbrisiFotografiju = (foto_id) => {
    $.post("/trgovina/fotografija/delete",
        {
            foto_id: foto_id,
        },
        function (data, status) {
            console.log(status);
            if (status)
                $('#ft' + foto_id).hide();
        });
}

const izbrisiArtikal = (id_artikla) => {
    $.post("/trgovina/delete",
        {
            id: id_artikla,
        },
        function (data, status) {
            console.log(status);
            if (status)
                $('#' + id_artikla).hide();
        });
}

const getHtml = (nav_item) => {
    let ruta;
    if (nav_item === 'narudzbe') {
        ruta = "/trgovina/narudzbe";
    }
    else if (nav_item === 'postavke') {
        ruta = "/trgovina/postavke";
    }
    $.get(ruta,
        function (data, status) {
            //console.log(data);
            $("#main").html(data);
        });

}