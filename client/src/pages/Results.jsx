import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { jsPDF } from 'jspdf';

export default function Results() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI.sessions().then(res => {
      const s = res.data.find(s => s._id === sessionId);
      setSession(s || res.data[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [sessionId]);

  const exportPDF = () => {
    if (!session) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('AdaptIQ — Quiz Results', 20, 30);
    doc.setFontSize(12);
    doc.text(`Topic: ${session.topic}`, 20, 50);
    doc.text(`Score: ${session.correctCount}/${session.totalCount} (${session.accuracy?.toFixed(1)}%)`, 20, 60);
    doc.text(`XP Earned: ${session.xpEarned}`, 20, 70);
    doc.text(`Theta: ${session.thetaEnd?.toFixed(2)}`, 20, 80);
    doc.text(`Duration: ${Math.floor(session.duration / 60)}m ${session.duration % 60}s`, 20, 90);

    let y = 110;
    session.answers?.forEach((a, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.text(`${i + 1}. ${a.questionStem?.substring(0, 60)}...`, 20, y);
      doc.setTextColor(a.isCorrect ? '#22c55e' : '#ef4444');
      doc.text(a.isCorrect ? '✓ Correct' : '✗ Incorrect', 20, y + 6);
      doc.setTextColor('#000');
      y += 14;
    });

    doc.save(`adaptiq-quiz-${session.topic}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-adaptiq-500 border-t-transparent rounded-full mx-auto" /></div>;

  if (!session) return <div className="text-center py-20 text-slate-400">Session not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card text-center">
        <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
        <p className="text-slate-400 capitalize mb-6">{session.topic} · {session.mode} mode</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div>
            <p className="text-3xl font-bold text-adaptiq-400">{session.correctCount}/{session.totalCount}</p>
            <p className="text-xs text-slate-400">Score</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-400">{session.accuracy?.toFixed(0)}%</p>
            <p className="text-xs text-slate-400">Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400">+{session.xpEarned}</p>
            <p className="text-xs text-slate-400">XP Earned</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-400">{session.thetaEnd?.toFixed(2)}</p>
            <p className="text-xs text-slate-400">θ (Ability)</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Back to Home</Link>
          <button onClick={exportPDF} className="btn-secondary">Export PDF</button>
        </div>
      </div>

      {session.answers?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Answer Details</h3>
          <div className="space-y-3">
            {session.answers.map((a, i) => (
              <div key={i} className={`p-3 rounded-lg border ${a.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <p className="text-sm font-medium mb-1">{i + 1}. {a.questionStem}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{a.isCorrect ? '✓ Correct' : `✗ Wrong (chose: ${String.fromCharCode(65 + a.selectedIndex)}, correct: ${String.fromCharCode(65 + a.correctIndex)})`}</span>
                  <span>θ: {a.thetaBefore?.toFixed(2)} → {a.thetaAfter?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
