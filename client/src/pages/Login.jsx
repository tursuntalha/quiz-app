import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to AdaptIQ</h2>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field w-full" required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field w-full" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Loading...' : 'Login'}</button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-4">
          No account? <Link to="/register" className="text-adaptiq-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
