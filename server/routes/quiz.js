const router = require('express').Router();
const { authMiddleware } = require('./auth');
const User = require('../models/User');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');
const { estimateTheta, selectNextQuestion } = require('../engines/irt');
const { sm2Schedule } = require('../engines/sm2');
const { generateQuestion } = require('../engines/generator');

router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { topic, mode = 'new' } = req.body;
    const user = await User.findById(req.user.id);

    let questions;
    if (mode === 'review') {
      // Get questions from topics due for review
      const sr = user.spacedRepetition.get(topic) || {};
      questions = await Question.find({ topic });
    } else {
      questions = await Question.find({ topic });
    }

    if (questions.length === 0) {
      // Generate questions on demand
      const gen = await generateQuestion(topic, 0, 5);
      if (gen && gen.length > 0) {
        questions = await Question.insertMany(gen.map(q => ({
          ...q, topic, source: 'generated',
        })));
      }
    }

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available for this topic' });
    }

    const theta = user.theta.get(topic) || 0;
    const selected = selectNextQuestion(questions, theta, 10);

    const session = new QuizSession({
      userId: user._id,
      topic,
      mode,
      thetaStart: theta,
      answers: [],
    });
    await session.save();

    res.json({
      sessionId: session._id,
      questions: selected.map(q => ({
        id: q._id,
        stem: q.stem,
        options: q.options,
        difficulty: q.difficulty,
        topic: q.topic,
      })),
      theta,
      totalQuestions: questions.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/answer', authMiddleware, async (req, res) => {
  try {
    const { sessionId, questionId, selectedIndex, timeTaken } = req.body;
    const session = await QuizSession.findById(sessionId);
    if (!session || session.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const isCorrect = selectedIndex === question.correctIndex;
    const thetaBefore = session.thetaEnd;
    const thetaAfter = estimateTheta(thetaBefore, question.difficulty, isCorrect);

    session.answers.push({
      questionId: question._id,
      questionStem: question.stem,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      timeTaken,
      difficulty: question.difficulty,
      thetaBefore,
      thetaAfter,
    });

    if (isCorrect) session.correctCount++;
    session.totalCount++;
    session.thetaEnd = thetaAfter;
    await session.save();

    // Update user theta
    const UserModel = User;
    const user = await UserModel.findById(req.user.id);
    user.theta.set(session.topic, thetaAfter);

    // SM-2 update
    const quality = isCorrect ? (timeTaken < 30 ? 5 : 4) : (selectedIndex === question.correctIndex ? 2 : 0);
    const sr = user.spacedRepetition.get(session.topic) || {};
    user.spacedRepetition.set(session.topic, sm2Schedule(sr, quality));
    await user.save();

    res.json({
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      thetaBefore,
      thetaAfter,
      thetaDelta: (thetaAfter - thetaBefore).toFixed(3),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await QuizSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.status = 'completed';
    session.completedAt = new Date();
    session.duration = Math.round((session.completedAt - new Date(session.startedAt)) / 1000);

    // XP calculation
    const baseXP = session.correctCount * 10;
    const difficultyMultiplier = 1 + Math.max(0, session.thetaEnd) * 0.5;
    session.xpEarned = Math.round(baseXP * difficultyMultiplier);

    await session.save();

    // Update user XP and streak
    const UserModel = User;
    const user = await UserModel.findById(req.user.id);
    user.xp += session.xpEarned;

    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate === today) {
      // Already active today
    } else if (user.lastActiveDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
      user.streak += 1;
    } else {
      if (user.freezes > 0) {
        user.freezes -= 1;
      } else {
        user.streak = 1;
      }
    }
    user.lastActiveDate = today;
    await user.save();

    res.json({
      sessionId: session._id,
      correctCount: session.correctCount,
      totalCount: session.totalCount,
      accuracy: session.accuracy,
      xpEarned: session.xpEarned,
      thetaEnd: session.thetaEnd,
      duration: session.duration,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sessions', authMiddleware, async (req, res) => {
  const sessions = await QuizSession.find({ userId: req.user.id })
    .sort({ createdAt: -1 }).limit(50);
  res.json(sessions);
});

module.exports = router;
