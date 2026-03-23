require('dotenv').config();
const mongoose = require('mongoose');
const app      = require('./app');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => console.error('Error conectando a MongoDB:', err));