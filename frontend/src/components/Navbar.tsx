import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, ShieldCheck, Tv } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/30">
            🎉
          </div>
          <div>
            <span className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              FRESHER 2026
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md">
              Live Arena OS
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link
            to="/student"
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              location.pathname.startsWith('/student')
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Student</span>
          </Link>

          <Link
            to="/management"
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              location.pathname.startsWith('/management')
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Management</span>
          </Link>

          <Link
            to="/auditorium"
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              location.pathname.startsWith('/auditorium')
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Auditorium</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
