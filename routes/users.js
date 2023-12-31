var express = require('express');
var router = express.Router();
const { body, validationResult, matchedData } = require('express-validator')
const User = require('../models/User');
const bcrypt = require('bcrypt')
const { auth } = require('../middleware/auth')

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
      const token = createToken(user._id)
      res.cookie('jwt', token, { maxAge: expiresAt * 1000, httpOnly: true })
      res.status(200).redirect('/dashboard')
    } catch (error) {
      console.log(error.message)
      res.status(400).render('login', { form: [], errors: [], loginError: error.message })

    }
  } else {
    res.render('Login', { errors: result["errors"], form: [], loginError: [] })
  }

})

router.get('/register', async (req, res, next) => {
  const isLoggedIn = await auth(req, res)
  if (isLoggedIn) {
    res.redirect('/dashboard')
  }
  res.render('register', { loginError: [], form: [], error: [] });
});


router.post('/register', body('username').notEmpty().escape().withMessage('username is required !'), body('email').isEmail().trim().withMessage("valid email is required !"), body('password').isLength({ min: 8 }), async (req, res) => {
  const result = validationResult(req)
  const body = req.body


  if (result.isEmpty()) {
    const data = matchedData(req)

    const user = await User.findOne({ email: data["email"] })
    if (user) {
      res.render('register', { error: [], loginError: "email already exists", form: [] })
    } else {
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
          return res.status(201).redirect('/dashboard')
        });
      });
    }


  } else {
    res.render('register', { loginError: [], error: result["errors"], form: [] })
  }
})

router.get('/find', function (req, res) {
  const user = User.find({})
  res.send({ users: user })
})

router.get('/login', async (req, res, next) => {
  const isLoggedIn = await auth(req, res)
  if (isLoggedIn) {
    res.redirect('/dashboard')
  }
  res.render('login', { form: [], errors: [], loginError: [] })
});

module.exports = router;
