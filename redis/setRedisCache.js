const { createClient } = require('redis')
const asyncErrCatcher = require('../middlewares/asyncErrCatcher')
const dotenv = require('dotenv')

if (process.env.NODE_ENV !== 'Production') {
  dotenv.config()
}
let redisClient = createClient({
  legacyMode: true,
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
})

// const setRedisCache = asyncErrCatcher(async (req, res, next) => {
//   try {
//     await redisClient.connect().catch(console.error)

//     let upInfo = req.body
//     await redisClient.setEx('info', 3600, JSON.stringify(upInfo))
//     next()
//   } catch (err) {
//     console.error(`Error setting Redis cache: ${err}`)
//     res.status(500).json({ error: true, message: 'Internal server error' })
//   }
// })

const getRedisCache = asyncErrCatcher(async (req, res, next) => {
  try {
    await redisClient.connect().catch(console.error)
    await redisClient.get('info', async (err, data) => {
      if (err) throw err

      if (data !== null) {
        req.n_info = data
      } else {
        let upInfo = req.body
        await redisClient.setEx('info', 3600, JSON.stringify(upInfo))
        next()
      }
    })
  } catch (err) {
    console.error(`Error setting Redis cache: ${err}`)
    res.status(500).json({ error: true, message: 'Internal server error' })
  }
})

module.exports = getRedisCache
