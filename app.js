const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const connectDb = require('./db/database')
const app = express()

app.use(cookieParser())
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)
app.use(express.json())

connectDb()

process.on('uncaughtException', err => {
  console.log(`Error: ${err.message}`)
  console.log('Shutting Server down for Uncaught Exception')
})

process.on('unhandledRejection', err => {
  console.log(`Err: ${err.message}`)
  console.log('Shutting Server down for Unhandled Rejection')
  server.close(() => {
    process.exit(1)
  })
})

const server = app.listen(5000, (req, res) => {
  console.log('App is listening on port 5000')
})
