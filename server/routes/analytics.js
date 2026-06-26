const router = require('express').Router();
const { authMiddleware } = require('./auth');
const User = require('../models/User');
const QuizSession = require('../models/QuizSession');

router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const sessions = await QuizSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(200);

  const topicStats = {};
  for (const s of sessions) {
    if (!topicStats[s.topic]) {
      topicStats[s.topic] = { correct: 0, total: 0, sessions: 0, thetaValues: [] };
    }
    topicStats[s.topic].correct += s.correctCount;
    topicStats[s.topic].total += s.totalCount;
    topicStats[s.topic].sessions += 1;
    topicStats[s.topic].thetaValues.push(s.thetaEnd);
  }

  const radarData = Object.entries(topicStats).map(([topic, st]) => ({
    topic,
    accuracy: st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0,
    sessions: st.sessions,
    theta: st.thetaValues.length > 0 ? st.thetaValues[st.thetaValues.length - 1] : 0,
  }));

  res.json({
    user: user.toPublic(),
    topicPerformance: radarData,
    totalSessions: sessions.length,
    totalCorrect: sessions.reduce((a, s) => a + s.correctCount, 0),
    totalQuestions: sessions.reduce((a, s) => a + s.totalCount, 0),
    totalXP: user.xp,
    streak: user.streak,
  });
});

router.get('/sessions', authMiddleware, async (req, res) => {
  const { topic, limit = 50 } = req.query;
  const filter = { userId: req.user.id };
  if (topic) filter.topic = topic;
  const sessions = await QuizSession.find(filter)
    .sort({ createdAt: -1 }).limit(Number(limit));
  res.json(sessions);
});

router.get('/leaderboard', async (req, res) => {
  const { topic, limit = 100 } = req.query;
  let users = await User.find().sort({ xp: -1 }).limit(Number(limit));

  let leaderboard = users.map((u, i) => ({
    rank: i + 1,
    username: u.username,
    xp: u.xp,
    streak: u.streak,
    theta: topic ? (u.theta.get(topic) || 0) : undefined,
  }));

  if (topic) {
    leaderboard.sort((a, b) => (b.theta || 0) - (a.theta || 0));
    leaderboard = leaderboard.map((u, i) => ({ ...u, rank: i + 1 }));
  }

  res.json(leaderboard.slice(0, Number(limit)));
});

router.get('/retention/:topic', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  const sr = user.spacedRepetition.get(req.params.topic) || {};
  res.json({
    topic: req.params.topic,
    easeFactor: sr.easeFactor || 2.5,
    interval: sr.interval || 0,
    repetitions: sr.repetitions || 0,
    nextReview: sr.nextReview || null,
    lastReviewDate: sr.lastReviewDate || null,
  });
});

module.exports = router;
