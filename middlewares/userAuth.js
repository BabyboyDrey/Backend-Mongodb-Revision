const asyncErrCatcher = require('./asyncErrCatcher.js')
const jwt = require('jsonwebtoken')
const User = require('../models/users')

exports.userAuth = asyncErrCatcher(async (req, res, next) => {
  const token = req.cookies.token

  if (!token)
    return res.status(401).json('Unauthorized Access! Login or Sign-Up')

  const verified = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findOne({ username: verified.username }).maxTimeMS(
    10000
  )
  next()
})
