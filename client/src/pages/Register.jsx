import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Username</label>
            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input-field w-full" required minLength={3} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field w-full" required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field w-full" required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Loading...' : 'Register'}</button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-4">
          Already registered? <Link to="/login" className="text-adaptiq-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
