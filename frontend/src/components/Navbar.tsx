import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Tv, UserCheck, Sparkles } from 'lucide-react';
import { useManagementStore } from '../store/useManagementStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const token = useManagementStore((state) => state.token);
  const adminUser = useManagementStore((state) => state.adminUser);

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/40 group-hover:scale-105 transition-transform">
            🎉
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300">
              FRESHER 2026
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-extrabold tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md">
              Live Arena OS
            </span>
          </div>
        </Link>

        {/* Only show Host Management & Stage Auditorium links if Admin is logged in */}
        {token ? (
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            <span className="hidden md:inline-flex items-center space-x-1.5 text-[11px] font-extrabold text-purple-200 bg-purple-950/80 border border-purple-500/40 px-3 py-1 rounded-xl shadow-inner">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Host: {adminUser || 'Nax'}</span>
            </span>

            <Link
              to="/management/dashboard"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                location.pathname.startsWith('/management')
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/35 border border-purple-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Management</span>
            </Link>

            <Link
              to="/auditorium"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                location.pathname.startsWith('/auditorium')
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/35 border border-pink-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Auditorium</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center space-x-2.5">
            <span className="hidden sm:inline-flex text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Student Arena Live</span>
            </span>

            <Link
              to="/management/login"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-purple-950/60 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-all shadow-md active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 group-hover:text-white" />
              <span>Admin Login</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

