const request = require('supertest')
const app     = require('../app')
require('./setup')

describe('POST /api/auth/register', () => {
it('registra un usuario y devuelve token', async () => {
  const res = await request(app).post('/api/auth/register').send({
    username: 'testuser',
    email: 'test@test.com',
    password: '123456'
  })
  expect(res.statusCode).toBe(201)
  expect(res.body).toHaveProperty('token')
})

  it('rechaza si faltan campos', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' })
    expect(res.statusCode).toBe(400)
  })

  it('rechaza email duplicado', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'user1', email: 'dup@test.com', password: '123456'
    })
    const res = await request(app).post('/api/auth/register').send({
      username: 'user2', email: 'dup@test.com', password: '123456'
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      username: 'loginuser', email: 'login@test.com', password: '123456'
    })
  })

  it('hace login con credenciales correctas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com', password: '123456'
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('rechaza contraseña incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com', password: 'wrong'
    })
    expect(res.statusCode).toBe(401)
  })
})
