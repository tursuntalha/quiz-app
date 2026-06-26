import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, questionAPI } from '../services/api';

export default function Review() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    Promise.all([analyticsAPI.profile(), questionAPI.topics()])
      .then(([p, t]) => setProfile(p.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-adaptiq-500 border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">Review Sessions</h2>
        <p className="text-slate-400 text-sm">SM-2 spaced repetition — review topics you&apos;ve studied before to reinforce retention.</p>
      </div>

      {profile?.topicPerformance?.length > 0 ? (
        <div className="grid gap-4">
          {profile.topicPerformance.map((t, i) => (
            <div key={i} className="card flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold capitalize">{t.topic}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                  <span>{t.sessions} sessions</span>
                  <span>{t.accuracy}% accuracy</span>
                  <span>θ: {t.theta?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              <button onClick={() => navigate(`/quiz/${t.topic}?mode=review`)}
                className="btn-primary text-sm !py-2">
                Review Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10 text-slate-400">
          <p className="text-lg mb-2">No review data yet</p>
          <p className="text-sm">Complete a quiz first, then come back to review.</p>
        </div>
      )}
    </div>
  );
}
