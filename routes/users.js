var express = require('express');
var router = express.Router();
const { body, validationResult, matchedData } = require('express-validator')
const User = require('../models/User');
const bcrypt = require('bcrypt')
const passport = require('passport')
const localStrategy = require('passport-local');
const { route } = require('.');
const dd = require('var_dump')

// const auth = require('./auth/authUser')
/* GET users listing. */

router.post('/login', body('username').notEmpty().escape().withMessage('username is required'), body('password').notEmpty().escape().withMessage('password is required'), function (req, res) {
  const result = validationResult(req)
  if (result.isEmpty()) {
    const { username, password } = req.body
    const user = User.findOne({ username: username })
    passport.use(new localStrategy(function auth(username, password, done) {
      const user = User.findOne({ username: username })
      console.log(user)
      done(null, user)
    }
    ))
  } else {
    res.render('Login', { errors: result["errors"], form: [] })
  }

})

router.get('/register', function (req, res, next) {
  res.render('register', { form: [], error: [] });
});


router.post('/register', body('username').notEmpty().escape().withMessage('username is required !'), body('email').isEmail().trim().withMessage("valid email is required !"), body('password').isLength({ min: 8 }), function (req, res) {
  const result = validationResult(req)
  const body = req.body

  if (result.isEmpty()) {
    const data = matchedData(req)

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(data["password"], salt, function (err, hash) {
        const user = new User({
          username: data["username"],
          email: data["email"],
          password: hash
        })
        user.save()
      });
    });


    return res.redirect('/')
  } else {
    res.render('index', { error: result["errors"], form: [] })
  }
})

router.get('/find', function (req, res) {
  const user = User.find({})
  res.send({ users: user })
})

router.get('/login', function (req, res, next) {
  res.render('login', { form: [], errors: [] })
});

module.exports = router;
