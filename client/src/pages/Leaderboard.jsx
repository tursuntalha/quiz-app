import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [filterTopic, setFilterTopic] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.leaderboard(filterTopic || undefined)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterTopic]);

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Global Leaderboard</h2>
          <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm">
            <option value="">All Topics (by XP)</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="react">React</option>
            <option value="algorithms">Algorithms</option>
            <option value="databases">Databases</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-4 border-adaptiq-500 border-t-transparent rounded-full mx-auto" /></div>
        ) : data.length === 0 ? (
          <p className="text-center py-10 text-slate-400">No data yet. Start quizzing!</p>
        ) : (
          <div className="space-y-2">
            {data.map((entry, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${i < 3 ? 'bg-slate-800/80' : 'hover:bg-slate-800/50'}`}>
                <span className="w-10 text-center text-lg">{getMedal(entry.rank)}</span>
                <div className="flex-1">
                  <p className="font-medium">{entry.username}</p>
                  <p className="text-xs text-slate-400">
                    {entry.xp} XP · {entry.streak} day streak
                    {entry.theta !== undefined && ` · θ: ${entry.theta.toFixed(2)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-400">{entry.xp.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
