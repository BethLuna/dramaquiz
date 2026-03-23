const request = require('supertest')
const app     = require('../app')
require('./setup')

const registerUser = async (suffix = '') => {
  const res = await request(app).post('/api/auth/register').send({
    username: `user${suffix}`,
    email: `user${suffix}@test.com`,
    password: '123456'
  })
  return { token: res.body.token, user: res.body.user }
}

describe('CRUD /api/users', () => {

  it('GET — lista todos los usuarios', async () => {
    await registerUser('A')
    await registerUser('B')
    const res = await request(app).get('/api/users')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(2)
  })

  it('GET /:id — devuelve un usuario por ID', async () => {
    const { user } = await registerUser('C')
    const res = await request(app).get(`/api/users/${user.id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.email).toBe('userc@test.com')
  })

  it('GET /:id — no expone password_hash', async () => {
    const { user } = await registerUser('D')
    const res = await request(app).get(`/api/users/${user.id}`)
    expect(res.body).not.toHaveProperty('password_hash')
  })

  it('PUT — edita el propio usuario', async () => {
    const { token, user } = await registerUser('E')
    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'userE_editado', drama_type_pref: 'kdrama' })
    expect(res.statusCode).toBe(200)
    expect(res.body.user.username).toBe('userE_editado')
    expect(res.body.user.drama_type_pref).toBe('kdrama')
  })

  it('PUT — rechaza editar otro usuario', async () => {
    const { user: userF } = await registerUser('F')
    const { token: tokenG } = await registerUser('G')
    const res = await request(app)
      .put(`/api/users/${userF.id}`)
      .set('Authorization', `Bearer ${tokenG}`)
      .send({ username: 'intento_hack' })
    expect(res.statusCode).toBe(403)
  })

  it('DELETE — elimina el propio usuario', async () => {
    const { token, user } = await registerUser('H')
    const del = await request(app)
      .delete(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(del.statusCode).toBe(200)

    const check = await request(app).get(`/api/users/${user.id}`)
    expect(check.statusCode).toBe(404)
  })
})
