const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  stem: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
  topic: { type: String, required: true, index: true },
  difficulty: { type: Number, default: 0.0, min: -3, max: 3 }, // IRT b parameter
  source: { type: String, enum: ['seed', 'generated'], default: 'seed' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
