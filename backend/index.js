const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const questionRoutes  = require('./routes/questions');
const scoreRoutes     = require('./routes/scores');

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

app.get('/', (req, res) => {
  res.json({ message: 'DramaQuiz API funcionando' });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => console.error('Error conectando a MongoDB:', err));