const User = require('../../models/User')

module.exports = verify = (username, password, done) => {
    const user = User.findOne({ username: username })
    console.log(user)
}

