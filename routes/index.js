var express = require('express');
var router = express.Router();
const { auth } = require('../middleware/auth')
const { requireAuth } = require('../middleware/auth')

const validation = function () { }

router.get('/', async (req, res, next) => {
  const isLoggedIn = await auth(req, res)
  if (isLoggedIn) {
    res.render('index', { form: [], error: [], isLoggedIn: true });
  }
  res.render('index', { form: [], error: [], isLoggedIn: false });
});

router.get('/dashboard', requireAuth, function (req, res) {
  res.render('Home', { isLoggedIn: true })
})

module.exports = router;
