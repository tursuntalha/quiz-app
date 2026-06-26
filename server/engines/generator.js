/**
 * Ollama Question Generator
 * Generates quiz questions using a local LLM via Ollama API
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'qwen2.5:7b';

const questionCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

/**
 * Build a prompt for question generation
 */
function buildPrompt(topic, difficulty, count) {
  const difficultyLabel = difficulty < -1 ? 'easy' : difficulty > 1 ? 'hard' : 'medium';

  return `Generate exactly ${count} multiple-choice questions about "${topic}" at ${difficultyLabel} difficulty.

Return ONLY a valid JSON array (no other text). Each object must have:
{
  "stem": "question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "why this answer is correct"
}

Rules:
- correctIndex must be 0-3 matching the correct option
- Explanation should be 1-2 sentences
- Questions should test understanding, not just recall
- Make questions appropriate for ${difficultyLabel} level`;
}

/**
 * Parse LLM output, handling various JSON formats
 */
function parseLLMOutput(text) {
  // Try to find JSON array in the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No JSON array found in LLM output');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    // Try to fix common issues
    const cleaned = jsonMatch[0]
      .replace(/(\w+):/g, '"$1":')
      .replace(/'(.*?)'/g, '"$1"');
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse LLM output as JSON');
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('LLM output is not an array');
  }

  return parsed.map(q => ({
    stem: q.stem || q.question || '',
    options: Array.isArray(q.options) ? q.options : [],
    correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : q.correct,
    explanation: q.explanation || '',
  })).filter(q => q.stem && q.options.length === 4 && typeof q.correctIndex === 'number');
}

/**
 * Generate questions using Ollama
 */
async function generateQuestion(topic, difficulty = 0, count = 5) {
  const cacheKey = `${topic}:${difficulty}:${count}`;
  const cached = questionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.questions;
  }

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const prompt = buildPrompt(topic, difficulty, count);
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          prompt,
          stream: false,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const questions = parseLLMOutput(data.response);

      if (questions.length >= count / 2) {
        // Cache the result
        questionCache.set(cacheKey, {
          questions: questions.slice(0, count),
          timestamp: Date.now(),
        });
        return questions.slice(0, count);
      }
    } catch (err) {
      console.error(`Generation attempt ${attempts + 1} failed:`, err.message);
    }
    attempts++;
  }

  // Fallback: return static seed-like questions
  return [{
    stem: `What is a key concept in ${topic}?`,
    options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
    correctIndex: 0,
    explanation: `This is a fundamental concept in ${topic}.`,
  }];
}

/**
 * Generate explanation for a wrong answer
 */
async function generateExplanation(topic, question, selectedAnswer, correctAnswer) {
  try {
    const prompt = `A student answered this ${topic} question incorrectly.

Question: "${question.stem}"
Options: ${question.options.join(', ')}
They chose: "${selectedAnswer}"
Correct answer: "${correctAnswer}"

Explain in 1-2 sentences why the correct answer is right and why their choice is wrong. Be concise and helpful.`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        temperature: 0.3,
        max_tokens: 256,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.response.trim();
  } catch {
    return null;
  }
}

module.exports = { generateQuestion, generateExplanation };
