const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionStem: String,
  selectedIndex: Number,
  correctIndex: Number,
  isCorrect: Boolean,
  timeTaken: Number, // seconds
  difficulty: Number,
  thetaBefore: Number,
  thetaAfter: Number,
}, { _id: false });

const quizSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic: { type: String, required: true },
  mode: { type: String, enum: ['new', 'review'], default: 'new' },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  answers: [answerSchema],
  thetaStart: { type: Number, default: 0 },
  thetaEnd: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // total seconds
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
}, { timestamps: true });

quizSessionSchema.virtual('accuracy').get(function () {
  return this.totalCount > 0 ? (this.correctCount / this.totalCount) * 100 : 0;
});

quizSessionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('QuizSession', quizSessionSchema);
