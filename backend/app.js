require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth');
const userRoutes     = require('./routes/users');
const questionRoutes = require('./routes/questions');
const scoreRoutes    = require('./routes/scores');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/scores',    scoreRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'DramaQuiz API funcionando' });
});

module.exports = app;