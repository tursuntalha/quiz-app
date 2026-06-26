import { useState, useCallback } from 'react';

/**
 * Hook for 1-PL IRT tracking (client-side display)
 * The actual θ updates happen server-side
 */
export function useIRT(initialTheta = 0) {
  const [theta, setTheta] = useState(initialTheta);
  const [history, setHistory] = useState([]);

  const estimateNextTheta = useCallback((currentTheta, difficulty, correct) => {
    const p = 1 / (1 + Math.exp(-(currentTheta - difficulty)));
    const gradient = (correct ? 1 : 0) - p;
    const newTheta = Math.max(-3, Math.min(3, currentTheta + 0.5 * gradient));
    return Math.round(newTheta * 1000) / 1000;
  }, []);

  const recordAnswer = useCallback((difficulty, correct) => {
    const newTheta = estimateNextTheta(theta, difficulty, correct);
    setHistory(prev => [...prev, { thetaBefore: theta, difficulty, correct, thetaAfter: newTheta }]);
    setTheta(newTheta);
    return newTheta;
  }, [theta, estimateNextTheta]);

  const reset = useCallback((initial = 0) => {
    setTheta(initial);
    setHistory([]);
  }, []);

  return { theta, history, recordAnswer, reset };
}
