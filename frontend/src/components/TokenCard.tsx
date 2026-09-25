import React from 'react';
import { Ticket, Sparkles, Star } from 'lucide-react';

interface TokenCardProps {
  name: string;
  tokenNo: number;
  luckyNo: number;
  spotlightNo: number;
}

export const TokenCard: React.FC<TokenCardProps> = ({ name, tokenNo, luckyNo, spotlightNo }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 glass-card bg-gradient-to-br from-slate-900/95 via-purple-950/50 to-slate-900/95 border border-purple-500/35 shadow-2xl">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between border-b border-purple-500/20 pb-3.5 mb-3.5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
            FRESHER 2026 PASS
          </span>
          <h2 className="font-display text-2xl font-black text-white tracking-tight mt-1">{name}</h2>
        </div>
        <div className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/40 px-3.5 py-1.5 rounded-xl shadow-inner">
          <Ticket className="w-4 h-4 text-purple-300" />
          <span className="font-mono text-sm font-black text-amber-300">#{String(tokenNo).padStart(3, '0')}</span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3">
        <div className="bg-slate-950/80 border border-amber-500/35 rounded-xl p-3 text-center transition-all duration-200 hover:border-amber-400/60 hover:scale-[1.02] shadow-md">
          <div className="flex items-center justify-center space-x-1 text-amber-400 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Lucky No.</span>
          </div>
          <div className="font-mono text-2xl font-black text-amber-300 glow-gold">
            {luckyNo}
          </div>
          <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Faculty 1v1 Draw</p>
        </div>

        <div className="bg-slate-950/80 border border-cyan-500/35 rounded-xl p-3 text-center transition-all duration-200 hover:border-cyan-400/60 hover:scale-[1.02] shadow-md">
          <div className="flex items-center justify-center space-x-1 text-cyan-400 mb-0.5">
            <Star className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Spotlight No.</span>
          </div>
          <div className="font-mono text-2xl font-black text-cyan-300 glow-cyan">
            {spotlightNo}
          </div>
          <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Stage Challenge</p>
        </div>
      </div>
    </div>
  );
};

