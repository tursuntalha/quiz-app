import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-adaptiq-400 to-purple-400 bg-clip-text text-transparent">
            AdaptIQ
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/leaderboard" className="text-slate-300 hover:text-white transition">Leaderboard</Link>
          {user ? (
            <>
              <Link to="/review" className="text-slate-300 hover:text-white transition">Review</Link>
              <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
                <span className="bg-adaptiq-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.username}</span>
                <span className="text-yellow-400 text-xs">{user.xp} XP</span>
              </Link>
              <button onClick={logout} className="text-slate-500 hover:text-white transition text-xs">Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm !py-1.5 !px-4">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
