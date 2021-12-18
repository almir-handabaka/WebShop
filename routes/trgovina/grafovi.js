var express = require('express');
var router = express.Router();

router.get('/grafovi', function (req, res, next) {
    res.send("Okej");
});


module.exports = router;