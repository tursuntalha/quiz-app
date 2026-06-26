# AdaptIQ — AI-Adaptive Learning & Quiz Platform

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **"Her soru sana özel."**

A quiz platform that learns from you. AdaptIQ generates questions on demand using a local LLM, dynamically adjusts difficulty using **Item Response Theory**, and schedules review sessions with the **SM-2 spaced repetition algorithm** — so you actually retain what you learn, instead of just passing a quiz.

---

## The Problem

Static quiz apps are broken by design. You ace 10 questions in a row and get 10 more at exactly the same level. You struggle with one topic and the app moves on anyway. Fixed question banks go stale — users memorize answers, not concepts.

There's no personalization. There's no real learning.

---

## The Solution

AdaptIQ is built around three AI-driven engines:

| Engine | What It Does | Technology |
|--------|-------------|-----------|
| **LLM Question Generator** | Generates fresh questions for any topic on demand | Ollama (`qwen2.5:7b`) |
| **IRT Difficulty Adapter** | Adjusts question difficulty in real-time based on your ability | 1-PL IRT model |
| **SM-2 Scheduler** | Schedules which topics to review and when | SM-2 algorithm |

---

## AI in Action

```
User: "Quantum computing hakkında 5 soruluk quiz ver, orta zorluk"
         │
         ▼
┌─────────────────────────────────────┐
│   Ollama — qwen2.5:7b               │
│   Prompt: topic + difficulty + count│
│   Output: JSON question objects     │
└──────────────────┬──────────────────┘
                   │
         ┌─────────▼─────────┐
         │  Question object   │
         │  - stem            │
         │  - 4 options       │
         │  - correct_index   │
         │  - explanation     │
         │  - difficulty (b)  │
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │  IRT Engine        │
         │  After each answer │
         │  → update θ        │
         │  → select next b   │
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │  SM-2 Scheduler    │
         │  Mark topic for    │
         │  review in N days  │
         └────────────────────┘
```

**Example generated question:**

```json
{
  "stem": "What does quantum superposition allow a qubit to do?",
  "options": [
    "Exist as 0 and 1 simultaneously",
    "Process data faster than any classical bit",
    "Operate at room temperature",
    "Store unlimited information"
  ],
  "correct_index": 0,
  "explanation": "Superposition allows a qubit to represent multiple
    states simultaneously, enabling quantum parallelism. This is
    fundamentally different from classical bits which are strictly 0 or 1.",
  "difficulty": 0.6
}
```

---

## Adaptive Difficulty — IRT Explained

Item Response Theory (IRT) models the probability of a correct answer as a function of the learner's **ability (θ)** and the question's **difficulty (b)**. After each answer, θ is updated using maximum likelihood estimation:

- Correct answer on a hard question → θ increases significantly
- Wrong answer on an easy question → θ decreases significantly
- The next question is selected so its difficulty `b ≈ θ` (maximally informative zone)

Two users in the same quiz session will receive completely different question sequences — each calibrated to their current ability level.

---

## Features

- **AI Question Generation** — any topic, fresh every time, with explanations (Ollama local LLM)
- **Adaptive Difficulty** — 1-PL IRT model updating θ after every answer
- **Spaced Repetition** — SM-2 algorithm creates personalized review schedule
- **Wrong-Answer Explanations** — LLM explains why your answer was wrong in plain language
- **Topic Performance Dashboard** — radar chart showing strength per subject area
- **Daily Streak & Leaderboard** — XP points, streak tracking, global ranking
- **Turkish Language Support** — full Turkish question generation out of the box
- **Export Quiz as PDF** — share or print any session

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Chart.js |
| Backend | Node.js, Express |
| Database | MongoDB (users, sessions, performance history) |
| AI / LLM | Ollama — `qwen2.5:7b` (runs locally, no API key needed) |
| Auth | JWT + refresh tokens |
| PDF Export | jsPDF |
| Algorithms | 1-PL IRT + SM-2 spaced repetition |

---

## Project Structure

```
quiz-app/
├── client/
│   ├── src/
│   │   ├── components/      # QuizCard, Timer, Dashboard, Leaderboard
│   │   ├── pages/           # Home, Quiz, Results, Profile, Review
│   │   ├── hooks/           # useIRT, useSM2, useQuizSession
│   │   └── services/        # api.js, ollama.js
├── server/
│   ├── routes/              # /quiz, /questions, /users, /analytics
│   ├── models/              # User, QuizSession, Question
│   ├── engines/
│   │   ├── irt.js           # IRT ability estimation (1-PL model)
│   │   ├── sm2.js           # Spaced repetition scheduler
│   │   └── generator.js     # Ollama question generation + parsing
│   └── server.js
└── README.md
```

---

## Roadmap

### Phase 1 — Core Quiz Engine
- [ ] MongoDB schemas: User, QuizSession, Question
- [ ] Basic quiz flow: display question → accept answer → score → next
- [ ] Static seed question bank (50 questions across 5 topics)
- [ ] Timer per question + results summary page
- [ ] JWT auth: register, login, protected routes

### Phase 2 — AI Question Generator
- [ ] Ollama endpoint integration (`qwen2.5:7b` local)
- [ ] Prompt engineering: topic + difficulty + count → validated JSON questions
- [ ] Parse LLM output with retry on malformed JSON
- [ ] Explanation generator: wrong answers get a follow-up LLM explanation
- [ ] Cache generated questions per topic to reduce repeated latency

### Phase 3 — IRT Difficulty Adaptation
- [ ] Implement 1-PL IRT model: `P(correct) = sigmoid(θ - b)`
- [ ] θ update using maximum likelihood after each answer
- [ ] Select next question: `argmin |b_i - θ|` from available pool
- [ ] Store θ per topic per user in MongoDB
- [ ] Visual "difficulty level" indicator during quiz

### Phase 4 — Spaced Repetition Scheduler (SM-2)
- [ ] Implement SM-2: ease factor, interval, repetition count
- [ ] Daily review queue: topics due for review surfaced on home page
- [ ] Separate "Review Mode" (SM-2-scheduled) vs "New Quiz Mode"
- [ ] Retention curve chart per topic (days since review vs accuracy)

### Phase 5 — Analytics Dashboard + Leaderboard
- [ ] Radar chart: accuracy per topic (Chart.js)
- [ ] Session history timeline
- [ ] XP system: base + difficulty multiplier per correct answer
- [ ] Daily streak with freeze protection (1 free skip per week)
- [ ] Global leaderboard (top 100 by XP, filterable by topic)
- [ ] PDF export of any quiz session (jsPDF)

---

## Getting Started

```bash
# Prerequisites: Node.js 18+, MongoDB, Ollama installed locally

# Pull the LLM model
ollama pull qwen2.5:7b

# Clone and install
git clone https://github.com/tursuntalha/quiz-app.git
cd quiz-app

# Backend
cd server && npm install
cp .env.example .env   # set MONGO_URI, JWT_SECRET, OLLAMA_URL
npm start

# Frontend
cd ../client && npm install
npm run dev
```

---

> Built by [Talha Tursun](https://github.com/tursuntalha) · AI-first learning tools for real retention.
