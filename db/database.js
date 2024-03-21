const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const connectDb = async () => {
  try {
    await mongoose
      .connect(
        process.env.MONGODB_CLIENT,
        {
          useUnifiedTopology: true,
          useNewUrlParser: true
        },
        { debug: true }
      )
      .then(console.log('Mongodb server connected'))
  } catch (err) {
    console.log(`Err: Err in mongodb connection; message: ${err}`)
  }
}

module.exports = connectDb
