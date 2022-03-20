const dozvoljenaRuta = (moze_pristupiti) => {
  return async (req, res, next) => {
    try {
      console.log(req.korisnik)
      if (moze_pristupiti.includes(req.korisnik.tip)) {
        console.log("Ima pristup");
        return next();
      }
      else {
        console.log("Nema pristup");
        return next(new Error("Korisnik nema pristup ovoj ruti"));
      }
    }
    catch (error) {
      return next(error);
    }
  }
}


module.exports = { dozvoljenaRuta };
