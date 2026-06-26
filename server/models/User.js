const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: '' },
  freezes: { type: Number, default: 1 },
  // Per-topic theta (IRT ability)
  theta: { type: Map, of: Number, default: {} },
  // SM-2 per topic
  spacedRepetition: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    xp: this.xp,
    streak: this.streak,
    theta: Object.fromEntries(this.theta || new Map()),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
