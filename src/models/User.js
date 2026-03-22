const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'El username es obligatorio'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  total_score: {
    type: Number,
    default: 0,
  },
  drama_type_pref: {
    type: String,
    enum: ['kdrama', 'cdrama', 'ambos'],
    default: 'ambos',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.model('User', UserSchema);
