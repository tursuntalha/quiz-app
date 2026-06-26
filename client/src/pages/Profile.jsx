import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Profile() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.profile().then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-adaptiq-500 border-t-transparent rounded-full mx-auto" /></div>;
  if (!data) return <div className="text-center py-20 text-slate-400">Failed to load profile.</div>;

  const radarData = {
    labels: data.topicPerformance.map(t => t.topic),
    datasets: [{
      label: 'Accuracy %',
      data: data.topicPerformance.map(t => t.accuracy),
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#6366f1',
    }],
  };

  return (
    <div className="space-y-6">
      <div className="card flex items-center gap-4">
        <div className="bg-adaptiq-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.username}</h2>
          <p className="text-slate-400 text-sm">{user.email}</p>
          <div className="flex gap-4 mt-1 text-sm">
            <span className="text-yellow-400">{data.totalXP} XP</span>
            <span className="text-orange-400">🔥 {data.streak} day streak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Topic Performance</h3>
          {data.topicPerformance.length > 0 ? (
            <Radar data={radarData} options={{ scales: { r: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.15)' }, pointLabels: { color: '#e2e8f0' } } }, plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
          ) : <p className="text-slate-400 text-sm">Complete a quiz to see topic performance.</p>}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-400">Total Sessions</span><span>{data.totalSessions}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Questions</span><span>{data.totalQuestions}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Correct</span><span className="text-green-400">{data.totalCorrect}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Overall Accuracy</span><span>{data.totalQuestions > 0 ? ((data.totalCorrect / data.totalQuestions) * 100).toFixed(1) : 0}%</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Session History</h3>
        {data.topicPerformance.length === 0 ? (
          <p className="text-slate-400 text-sm">No sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {data.topicPerformance.map((t, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-800 last:border-0">
                <span className="capitalize w-24 font-medium">{t.topic}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <div className="bg-adaptiq-500 h-2 rounded-full" style={{ width: `${t.accuracy}%` }} />
                </div>
                <span className="text-sm text-slate-400">{t.accuracy}%</span>
                <span className="text-xs text-slate-500">{t.sessions} sessions</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
