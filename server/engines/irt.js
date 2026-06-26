/**
 * 1-PL IRT Model (Rasch Model)
 * P(correct | theta, b) = 1 / (1 + exp(-(theta - b)))
 */

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function probabilityCorrect(theta, b) {
  return sigmoid(theta - b);
}

/**
 * Estimate theta using MLE after a single response
 * Simplified Newton-Raphson update
 */
function estimateTheta(theta, b, correct, learningRate = 0.5) {
  const p = probabilityCorrect(theta, b);
  const observed = correct ? 1 : 0;
  // Gradient of log-likelihood
  const gradient = observed - p;
  // Update theta
  const newTheta = theta + learningRate * gradient;
  // Clamp to reasonable range
  return Math.max(-3, Math.min(3, newTheta));
}

/**
 * Select the next question: pick one with difficulty closest to current theta
 */
function selectNextQuestion(questions, theta, n = 1) {
  const scored = questions.map(q => ({
    ...q.toObject ? q.toObject() : q,
    score: Math.abs(q.difficulty - theta),
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, n);
}

/**
 * Information function: I(theta, b) = P * (1 - P)
 * Maximum information when theta = b
 */
function information(theta, b) {
  const p = probabilityCorrect(theta, b);
  return p * (1 - p);
}

module.exports = { estimateTheta, selectNextQuestion, probabilityCorrect, information };
