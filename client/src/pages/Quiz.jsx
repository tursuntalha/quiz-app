import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { quizAPI, questionAPI } from '../services/api';

const TIMER_PER_QUESTION = 30;

export default function Quiz() {
  const { topic } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'new';

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(TIMER_PER_QUESTION);
  const [loading, setLoading] = useState(true);
  const [theta, setTheta] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await quizAPI.start(topic, mode);
        setSession(res.data);
        setQuestions(res.data.questions);
        setTheta(res.data.theta);
      } catch (err) {
        // Try to seed questions first
        try {
          await questionAPI.seed();
          const res = await quizAPI.start(topic, mode);
          setSession(res.data);
          setQuestions(res.data.questions);
          setTheta(res.data.theta);
        } catch {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [topic, mode, navigate]);

  useEffect(() => {
    if (feedback || loading) return;
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleAnswer(null);
          return TIMER_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [feedback, loading, currentIndex]);

  const handleAnswer = useCallback(async (selectedIndex) => {
    if (feedback) return;
    const timeTaken = TIMER_PER_QUESTION - timer;

    try {
      const res = await quizAPI.answer({
        sessionId: session.sessionId,
        questionId: questions[currentIndex].id,
        selectedIndex: selectedIndex,
        timeTaken,
      });
      setSelected(selectedIndex);
      setFeedback(res.data);
      setTheta(res.data.thetaAfter);
    } catch {
      // Offline fallback
      setSelected(selectedIndex);
      setFeedback({
        isCorrect: selectedIndex === questions[currentIndex].correctIndex,
        correctIndex: questions[currentIndex].correctIndex,
        explanation: questions[currentIndex].explanation,
        thetaAfter: theta,
      });
    }
  }, [feedback, timer, session, questions, currentIndex, theta]);

  const nextQuestion = async () => {
    if (currentIndex + 1 >= questions.length) {
      // Complete session
      try {
        await quizAPI.complete(session.sessionId);
      } catch {}
      navigate(`/results/${session.sessionId}`);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelected(null);
    setFeedback(null);
    setTimer(TIMER_PER_QUESTION);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-adaptiq-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!questions.length) {
    return <div className="text-center py-20 text-slate-400">No questions available. Try seeding the question bank.</div>;
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex-1 bg-slate-800 rounded-full h-2">
          <div className="bg-adaptiq-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-slate-400">{currentIndex + 1}/{questions.length}</span>
        {!feedback && <span className={`font-mono ${timer <= 10 ? 'text-red-400' : 'text-slate-400'}`}>{timer}s</span>}
      </div>

      {/* Theta indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Topic: <span className="text-slate-300 capitalize">{topic}</span></span>
        <span className="text-slate-500">θ: <span className={`font-mono ${theta > 0.5 ? 'text-green-400' : theta < -0.5 ? 'text-red-400' : 'text-yellow-400'}`}>{theta.toFixed(2)}</span></span>
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
            Difficulty: {q.difficulty.toFixed(2)}
          </span>
        </div>
        <h2 className="text-xl font-semibold mb-6">{q.stem}</h2>

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let btnClass = 'w-full text-left p-4 rounded-lg border transition-all duration-200 ';
            if (feedback === null) {
              btnClass += 'border-slate-700 hover:border-adaptiq-500 bg-slate-800/50 hover:bg-slate-800';
            } else if (i === q.correctIndex) {
              btnClass += 'border-green-500 bg-green-500/10 text-green-300';
            } else if (i === selected && !feedback.isCorrect) {
              btnClass += 'border-red-500 bg-red-500/10 text-red-300';
            } else {
              btnClass += 'border-slate-700 bg-slate-800/30 opacity-50';
            }

            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={feedback !== null}
                className={btnClass}>
                <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {opt}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-lg ${feedback.isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <p className="font-medium mb-1">{feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
              <p className="text-sm text-slate-300">{feedback.explanation}</p>
              <p className="text-xs text-slate-500 mt-2">θ: {feedback.thetaBefore.toFixed(2)} → {feedback.thetaAfter.toFixed(2)}</p>
            </div>
            <button onClick={nextQuestion} className="btn-primary w-full">
              {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
