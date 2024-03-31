const { createClient } = require('redis')
const asyncErrCatcher = require('../middlewares/asyncErrCatcher')
const dotenv = require('dotenv')
const { promisify } = require('util')

dotenv.config()

const getRedisCache = asyncErrCatcher(async (req, res, next) => {
  const redisClient = createClient({
    legacyMode: true,
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  })
  redisClient.connect().catch(console.error)

  const setExAsync = promisify(redisClient.setEx).bind(redisClient)

  redisClient.on('error', err => {
    console.error('Redis connection error:', err)
  })
  try {
    if (redisClient.connect) {
      const getAsync = promisify(redisClient.get).bind(redisClient)

      const data = await getAsync('info')

      if (data !== null) {
        req.n_info = data
        return next()
      }
    }

    redisClient.once('connect', async () => {
      try {
        await setExAsync('info', 3600, JSON.stringify(req.body))
        next()
      } catch (err) {
        console.error(`Error setting Redis cache: ${err}`)
        res.status(500).json({ error: true, message: 'Internal server error' })
      }
    })

    redisClient.once('error', err => {
      console.error('Redis connection error:', err)
      res.status(500).json({ error: true, message: 'Internal server error' })
    })
  } catch (err) {
    console.error(`Error accessing Redis cache: ${err}`)
    res.status(500).json({ error: true, message: 'Internal server error' })
  }
})

module.exports = getRedisCache
