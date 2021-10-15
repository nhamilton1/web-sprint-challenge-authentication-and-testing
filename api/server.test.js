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

describe('[GET] /api/jokes after login', () => {
  it('requests with valid token obtain list of jokes', async () => {
    let res = await request(server).post('/api/auth/login').send({ username: 'bob', password: 'test123' })
    res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
    expect(res.body).toHaveLength(3)
    expect(res.body).toMatchObject([
      { id: "0189hNRf2g", joke: "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later." },
      { id: "08EQZ8EQukb", joke: "Did you hear about the guy whose whole left side was cut off? He's all right now." },
      { id: "08xHQCdx5Ed", joke: "Why didn’t the skeleton cross the road? Because he had no guts." },
    ])

  })
})
