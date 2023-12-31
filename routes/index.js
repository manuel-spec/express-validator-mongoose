var express = require('express');
var router = express.Router();

const validation = function () { }

router.get('/', function (req, res, next) {
  res.render('index', { form: [], error: [] });
});


module.exports = router;
