/**
 * SM-2 Spaced Repetition Algorithm
 * Based on P.A. Wozniak's SuperMemo SM-2 algorithm
 *
 * quality: 0-5 (0 = complete blackout, 5 = perfect recall)
 * Returns updated card state { easeFactor, interval, repetitions, nextReview, lastReviewDate }
 */

function sm2Schedule(card, quality) {
  const MIN_EF = 1.3;
  const DEFAULT_EF = 2.5;

  let { easeFactor = DEFAULT_EF, interval = 0, repetitions = 0, nextReview = null, lastReviewDate = null } = card || {};

  const today = new Date().toISOString().split('T')[0];

  if (quality < 3) {
    // Failed recall — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EF, easeFactor);

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  nextReview = nextDate.toISOString().split('T')[0];
  lastReviewDate = today;

  return { easeFactor: Math.round(easeFactor * 100) / 100, interval, repetitions, nextReview, lastReviewDate };
}

/**
 * Get topics due for review for a user
 */
function getDueTopics(user) {
  const today = new Date().toISOString().split('T')[0];
  const due = [];
  for (const [topic, card] of user.spacedRepetition) {
    if (!card.nextReview || card.nextReview <= today) {
      due.push(topic);
    }
  }
  return due;
}

module.exports = { sm2Schedule, getDueTopics };
