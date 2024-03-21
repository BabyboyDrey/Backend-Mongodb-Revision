const User = require('../models/users')
const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const sendMail = require('../utils/sendMail')
const asyncErrCatcher = require('../middlewares/asyncErrCatcher.js')
const userToken = require('../utils/userToken.js')
const userAuth = require('../middlewares/userAuth.js')

const createActivationToken = user => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const verifyActivationToken = token => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

router.post('/sign-up', async (req, res) => {
  try {
    const { username, email, password, age, electronicDevices } = req.body
    const foundUser = await User.findOne({ email: email }).amxTimeMS(10000)
    if (foundUser)
      return res.status(400).json(`User with email ${email} exists`)

    if (password.length < 6)
      return res.status(400).json('Password Required Length is 6 Charaters')

    const salt = bcrypt.genSaltSync(14)
    const hashedPass = bcrypt.hashSync(password, salt)

    const p_user = {
      username,
      email,
      password: hashedPass,
      age,
      electronicDevices
    }

    let activation_token = createActivationToken(p_user)
    let activationUrl = `https://localhost:5000/v1/api/user/${activation_token}`

    try {
      await sendMail({
        email: p_user.email,
        subject: 'Account Activation Link',
        message: `<Html><head> <style>
        h2 {
          color: #333;
          font-size: 24px;
        }
        h4 {
          color: #666;
          font-size: 16px;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }</head><body> <h2>Activation Link</h2>
        <p>Click on this link to activate your account:</p>
        <p><a href="${activationUrl}">Activate Now</a></p></body></Html>`
      }).then(
        res.status(201).json('Account Activation Link Sent to Your Email')
      )
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  } catch (err) {
    res.status(500).json('Unexpected Err')
  }
})

router.post('/:activationToken', async (req, res) => {
  try {
    const token = req.params

    const verified = verifyActivationToken(token)
    if (!verified) return res.status(400).json('Token Expired or NuLL')

    const newUser = await User.create(verified).maxTimeMS(10000)

    userToken(newUser, 200, res)
  } catch (err) {
    res.status(500).json(`Err message: ${err}`)
  }
})

router.post(
  '/login',
  asyncErrCatcher(async (req, res) => {
    const { username, password } = req.body
    const f_user = await User.findOne({ username: username }).maxTimeMS(10000)

    if (!f_user) return res.status(400).json('Err! User doesnt Exist')

    const c_pass = bcrypt.compareSync(f_user.password, password)
    if (!c_pass) {
      return res.status(400).json('Wrong Password')
    } else {
      userToken(f_user, 200, res)
    }
  })
)

router.put(
  '/update-userInfo',
  userAuth,
  asyncErrCatcher(async (req, res) => {
    try {
      const up_info = req.body
      const v_user = User.findOne({ username: req.user.username })

      if (v_user) return res.status(400).json('Invalid Username!')

      v_user = up_info.age
      if (up_info.electronicDevices) {
        const year = up_info.electronicDevices.year
        const f_index = v_user.electronicDevices.findIndex(i => i.year === year)

        if (!f_index) v_user.electronicDevices.push(up_info.year)

        v_user.electronices[f_index].year = up_info.electronicDevices.year
        v_user.electronices[f_index].year.phone =
          up_info.electronicDevices.year.phone
        v_user.electronices[f_index].year.laptop =
          up_info.electronicDevices.year.laptop
        v_user.electronices[f_index].year.monitor =
          up_info.electronicDevices.year.monitor

        await v_user.save()
        userToken(v_user, 200, res)
      }
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.delete(
  '/delete',
  userAuth,
  asyncErrCatcher(async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user.id).maxTimeMS(10000)

      res
        .cookie('token', null, {
          expiresIn: Date(),
          httpOnly: true
        })
        .status(200)
        .json('User successfully deleted')
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)
