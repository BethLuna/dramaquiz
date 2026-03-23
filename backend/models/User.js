const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

UserSchema.pre('save', async function () {
  if (!this.isModified('password_hash')) return;
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.model('User', UserSchema);