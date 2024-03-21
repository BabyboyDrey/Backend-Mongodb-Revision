const User = require('../models/users')

const userToken = async (user, statusCode, res) => {
  const token = user.getJwtToken()

  const options = {
    maxAge: new Date(Date.now() + 60 * 60 * 1000),
    http: true,
    samSite: 'none',
    secure: true
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user,
    token
  })
}

module.exports = userToken
