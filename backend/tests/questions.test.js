const request = require('supertest')
const app     = require('../app')
require('./setup')

const getToken = async () => {
  const res = await request(app).post('/api/auth/register').send({
    username: 'admin', email: 'admin@test.com', password: '123456'
  })
  return res.body.token
}

const sampleQuestion = {
  drama_type:    'kdrama',
  drama_title:   'Goblin',
  category:      'trama',
  question_text: '¿Quién es el goblin?',
  difficulty:    'facil',
  answers: [
    { answer_text: 'Kim Shin',  is_correct: true  },
    { answer_text: 'Wang Yeo',  is_correct: false },
    { answer_text: 'Ji Eun-tak', is_correct: false },
    { answer_text: 'Sunny',     is_correct: false },
  ]
}

describe('CRUD /api/questions', () => {

  it('GET — devuelve array vacío al inicio', async () => {
    const res = await request(app).get('/api/questions')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(0)
  })

  it('POST — crea una pregunta con token', async () => {
    const token = await getToken()
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleQuestion)
    expect(res.statusCode).toBe(201)
    expect(res.body.question).toHaveProperty('_id')
    expect(res.body.question.drama_title).toBe('Goblin')
    expect(res.body.question.answers).toHaveLength(4)
  })

  it('POST — rechaza creación sin token', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send(sampleQuestion)
    expect(res.statusCode).toBe(401)
  })

  it('GET — devuelve la pregunta creada', async () => {
    const token = await getToken()
    await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleQuestion)

    const res = await request(app).get('/api/questions')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].drama_title).toBe('Goblin')
  })

  it('GET /:id — devuelve una pregunta por ID', async () => {
    const token = await getToken()
    const created = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleQuestion)

    const id  = created.body.question._id
    const res = await request(app).get(`/api/questions/${id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body._id).toBe(id)
  })

  it('PUT — edita una pregunta', async () => {
    const token = await getToken()
    const created = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleQuestion)

    const id  = created.body.question._id
    const res = await request(app)
      .put(`/api/questions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ difficulty: 'dificil' })
    expect(res.statusCode).toBe(200)
    expect(res.body.question.difficulty).toBe('dificil')
  })

  it('DELETE — elimina una pregunta', async () => {
    const token = await getToken()
    const created = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleQuestion)

    const id  = created.body.question._id
    const del = await request(app)
      .delete(`/api/questions/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(del.statusCode).toBe(200)

    const check = await request(app).get(`/api/questions/${id}`)
    expect(check.statusCode).toBe(404)
  })
})
