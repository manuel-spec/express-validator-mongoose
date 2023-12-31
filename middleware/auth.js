const jwt = require('jsonwebtoken')
require('dotenv').config()

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, process.env.COOKIE_SECRET, ((error, decodedToken) => {
            if (error) {
                console.log(error.message)
                res.redirect('/users/login')
            } else {
                next()
            }
        }))
    }
    else {
        res.redirect('/users/login')
    }

}
const auth = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        try {
            const decodedToken = await jwt.verify(token, process.env.COOKIE_SECRET);
            return true;  // Token is valid
        } catch (error) {
            return false;  // Token verification failed
        }
    } else {
        return false;  // No token provided
    }
};

module.exports = {
    requireAuth, auth
}