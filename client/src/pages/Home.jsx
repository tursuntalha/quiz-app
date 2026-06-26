import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const TOPICS = [
  { id: 'javascript', label: 'JavaScript', icon: '🟨', color: '#f7df1e' },
  { id: 'python', label: 'Python', icon: '🐍', color: '#3776ab' },
  { id: 'react', label: 'React', icon: '⚛️', color: '#61dafb' },
  { id: 'algorithms', label: 'Algorithms', icon: '🧮', color: '#ff6b35' },
  { id: 'databases', label: 'Databases', icon: '🗄️', color: '#47a248' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('new');

  const startQuiz = (topic) => {
    if (!user) return navigate('/login');
    navigate(`/quiz/${topic}?mode=${mode}`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center py-10">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-adaptiq-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Her soru sana özel
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          AI-powered adaptive quizzes that learn with you. IRT difficulty, SM-2 spaced repetition, and LLM-generated questions.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <label className="text-slate-300">Mode:</label>
        <button onClick={() => setMode('new')} className={`px-4 py-2 rounded-lg font-medium transition ${mode === 'new' ? 'bg-adaptiq-600 text-white' : 'bg-slate-800 text-slate-400'}`}>New Quiz</button>
        <button onClick={() => setMode('review')} className={`px-4 py-2 rounded-lg font-medium transition ${mode === 'review' ? 'bg-adaptiq-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Review</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map(topic => (
          <button key={topic.id} onClick={() => startQuiz(topic.id)}
            className="card hover:border-adaptiq-500/50 transition-all duration-200 text-left group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{topic.icon}</span>
              <h3 className="text-lg font-semibold">{topic.label}</h3>
            </div>
            <p className="text-sm text-slate-400">Start a {mode === 'new' ? 'new' : 'review'} quiz session</p>
            {user && (
              <div className="mt-3 text-xs text-slate-500">
                θ: {((user.theta && user.theta[topic.id]) || 0).toFixed(2)}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
