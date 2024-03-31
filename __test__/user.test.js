const request = require('supertest')
const app = require('../app')
const User = require('../db/database.js')

beforeEach(async () => {
  // await User.find()
})

afterEach(async () => {})
afterAll(async () => {})

test('should sign up a user', async () => {
  await request(app)
    .post('/api/users/sign-up')
    .send({
      name: 'test',
      email: 'test@test.com',
      password: 'test1123'
    })
    .expect(200)
})
