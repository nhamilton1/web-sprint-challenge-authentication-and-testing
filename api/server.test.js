const server = require('./server')
const request = require('supertest')
const db = require('../data/dbConfig')
const jwtDecode = require('jwt-decode')

// Write your tests here
test('sanity', () => {
  expect(true).not.toBe(false)
})

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})


afterAll(async () => {
  await db.destroy()
})


describe('[GET] /jokes without auth', () => {
  let res
  beforeEach(async () => {
    res = await request(server).get('/api/jokes')
  })

  test('responds with 401 unauthorized', async () => {
    expect(res.status).toBe(401)
  })
})

describe('[POST] /api/auth/register', () => {

  let res
  beforeEach(async () => {
    res = await request(server).post('/api/auth/register').send({
      username: 'bob',
      password: 'test123'
    })
  })

  test('responds with 201', async () => {
    expect(res.status).toBe(201)
  })

  test('should contain newly created user', async () => {
    const bob = await db('users')
    expect(bob).toHaveLength(1)
  })

})

describe('[POST] /api/auth/login', () => {
  let res
  beforeEach(async () => {
    res = await request(server).post('/api/auth/login').send({
      username: 'bob',
      password: 'test123'
    })
  })

  test('should give welcome message', async () => {
    expect(res.body.message).toContain("welcome, bob")
  })

  test('responds with a token', async () => {
    let decoded = jwtDecode(res.body.token)
    expect(decoded).toHaveProperty('exp')
    expect(decoded).toHaveProperty('iat')
  })
})
