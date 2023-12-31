var express = require('express');
var router = express.Router();
const { body, validationResult, matchedData } = require('express-validator')
const User = require('../models/User');
const bcrypt = require('bcrypt')

const localStrategy = require('passport-local');
const { route } = require('.');
const dd = require('var_dump')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// const auth = require('./auth/authUser')
/* GET users listing. */
const expiresAt = 3 * 60 * 60 * 24

const createToken = (id) => {
  return jwt.sign({ id }, process.env.COOKIE_SECRET, { expiresIn: expiresAt })
}

const login = async (email, password) => {
  const user = await User.findOne({ email })
  if (user) {
    const auth = await bcrypt.compare(password, user.password)
    if (auth) {
      return user
    }
    throw Error("incorrect password")

  }
  throw Error("email doesn't exist")

}

router.post('/login', body('email').notEmpty().isEmail().escape().withMessage('valid email is required !'), body('password').notEmpty().escape().withMessage('password is required'), async (req, res) => {
  const result = validationResult(req)
  if (result.isEmpty()) {
    try {
      const user = await login(req.body.email, req.body.password)
      res.status(200).json({ user: user._id })
    } catch (error) {
      res.status(400).json({})
    }
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
        const token = createToken(user._id)
        res.cookie('jwt', token, { maxAge: expiresAt * 1000, httpOnly: true })
        return res.status(201).send({ token: token })
      });
    });


  } else {
    res.render('register', { error: result["errors"], form: [] })
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
