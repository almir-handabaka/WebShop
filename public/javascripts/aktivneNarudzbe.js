const prihvatiNarudzbu = (id_narudzbe) => {
    $.post("/trgovina/narudzbe/prihvati",
        {
            id_narudzbe: id_narudzbe,
        },
        function (data, status) {
            console.log(status);
            if (status) {
                let html = $('#' + id_narudzbe).clone();
                $('#' + id_narudzbe).hide();
                $('#' + id_narudzbe).remove();
                html.find("button.btn-success").text("Isporučeno");
                html.find("button.btn-danger").text("Otkaži");
                let broj = $('#narUToku').children().length;
                $('#narUToku').append(html);
                $('#' + id_narudzbe).show();
                $('#' + id_narudzbe).children().first().text(broj + 1);
            }

        });
}

const odbijNarudzbu = (id_narudzbe) => {
    $.post("/trgovina/narudzbe/odbij",
        {
            id_narudzbe: id_narudzbe,
        },
        function (data, status) {
            console.log(status);
            if (status) {
                $('#' + id_narudzbe).remove();
            }

        });
}

const isporucenaNarudzba = (id_narudzbe) => {
    $.post("/trgovina/narudzbe/isporuceno",
        {
            id_narudzbe: id_narudzbe,
        },
        function (data, status) {
            console.log(status);
            if (status) {
                $('#' + id_narudzbe).remove();
            }

        });
}