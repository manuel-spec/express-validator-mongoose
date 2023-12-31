const mongoose = require('mongoose')
const { isEmail } = require('validator')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true]
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

userSchema.statics.login = async (email, password) => {
    const user = this.findOne({ email })
    if (user) {
        console.log("user exists")
    } else {
        console.log("user doesn't exists")
    }
}

const User = mongoose.model('User', userSchema)

module.exports = User