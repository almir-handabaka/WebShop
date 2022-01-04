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
        t_lokacija = artikal.id;
        id_artikla = artikal.id_artikla;
    }
    else {
        $("#naziv").val("");
        $("#cijena").val("");
        $("#kolicina").val(1);
        $("#stanje").val(1);
        $("#kategorija").val(9);
        $("#lokacija").val(1);
        $("#opis").val("");
        t_lokacija = 1;
    }

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
                    $("#lokacija").append(`<option value = ${lokacije[i].id}>${lokacije[i].naziv_trgovine}</option>`);
                }
                $("#lokacija").val(t_lokacija);
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

    console.log($("#naziv").val());
    $.post(ruta,
        {
            naziv: $("#naziv").val(),
            cijena: $("#cijena").val(),
            kolicina: $("#kolicina").val(),
            stanje: $("#stanje").val(),
            kategorija: $("#kategorija").val(),
            lokacija: $("#lokacija").val(),
            opis: $("#opis").val(),
            id_artikla: id_artikla,
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

        });
}



const izbrisiArtikal = (id_artikla) => {
    $.post("/trgovina/delete",
        {
            id: id_artikla,
        },
        function (data, status) {
            console.log("Artikal uspjesno izbrisan");
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