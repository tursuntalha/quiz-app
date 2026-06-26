# AI-Powered Adaptive Quiz Platform

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logoColor=white)

A quiz platform that adapts difficulty in real time based on user performance. Combines spaced repetition scheduling with AI-generated questions for a personalized learning experience.

---

## How Adaptive Difficulty Works

```
User answers a question
         │
         ├── Correct + Fast → Increase difficulty
         ├── Correct + Slow → Maintain difficulty
         └── Wrong          → Decrease difficulty
                                      │
                              ┌───────▼────────────┐
                              │  IRT (Item Response │
                              │  Theory) Model      │
                              │  Estimates user     │
                              │  ability (θ)        │
                              └───────┬─────────────┘
                                      │
                              Select next question
                              matching θ ± 0.5
```

---

## Planned Features

- **Question bank** — categories (science, math, history, programming, Turkish), difficulty 1–5
- **Adaptive difficulty** — IRT-based real-time adjustment of question difficulty to user ability
- **Spaced repetition** — SM-2 algorithm schedules review questions at optimal intervals
- **AI question generation** — generate new questions on any topic via Ollama (local LLM) or OpenAI API
- **Analytics dashboard** — accuracy per category, ability curve over time, weak spots
- **Leaderboard** — global and friend rankings with ELO-style rating
- **Achievements** — badges for streaks, accuracy milestones, and category mastery
- **Question types** — multiple choice, true/false, short answer, fill-in-the-blank

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts (analytics) |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| AI | Ollama (local) / OpenAI API (cloud) |
| Auth | JWT |
| Algorithm | IRT (1PL model) + SM-2 spaced repetition |

---

## Roadmap

| Phase | Task | Status |
|-------|------|--------|
| Phase 1 | Question bank schema + seed data (500+ questions) | [ ] |
| Phase 2 | Basic quiz flow (MCQ, timer, scoring) | [ ] |
| Phase 3 | IRT ability estimation + adaptive question selection | [ ] |
| Phase 4 | SM-2 spaced repetition scheduler | [ ] |
| Phase 5 | User auth + progress persistence | [ ] |
| Phase 6 | AI question generation (Ollama integration) | [ ] |
| Phase 7 | Analytics dashboard (ability curve, weak areas) | [ ] |
| Phase 8 | Leaderboard + achievement system | [ ] |
| Phase 9 | Short answer and fill-in-the-blank question types | [ ] |
| Phase 10 | Deploy (frontend: Vercel, backend: Railway) | [ ] |

---

## Getting Started (planned)

```bash
git clone https://github.com/tursuntalha/quiz-app.git
cd quiz-app

# Backend
cd server && npm install
cp .env.example .env   # Add MONGO_URI, JWT_SECRET, OLLAMA_BASE_URL
npm start

# Frontend
cd ../client && npm install
npm run dev
```
