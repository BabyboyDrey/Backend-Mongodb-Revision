const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number
  },
  electronicDevices: [
    {
      year: {
        type: String,
        phone: {
          type: String
        },
        laptop: {
          type: String
        },
        monitor: {
          type: String
        }
      }
    }
  ],
  email: {
    type: String
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  }
})

const User = mongoose.model('User', userSchema)

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = User
