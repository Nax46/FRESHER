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
    <div className="relative overflow-hidden rounded-2xl p-6 glass-card bg-gradient-to-br from-slate-900/90 via-purple-950/40 to-slate-900/90 border border-purple-500/30 shadow-2xl">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Fresher 2026 Pass</span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{name}</h2>
        </div>
        <div className="flex items-center space-x-1 bg-purple-500/20 border border-purple-400/30 px-3 py-1.5 rounded-full">
          <Ticket className="w-4 h-4 text-purple-300" />
          <span className="text-xs font-bold text-purple-200"># {String(tokenNo).padStart(3, '0')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-3 text-center transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-center space-x-1 text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Lucky No.</span>
          </div>
          <div className="text-2xl font-black text-amber-300">
            {luckyNo}
          </div>
          <p className="text-[9px] text-amber-400/70 mt-0.5">Faculty 1v1</p>
        </div>

        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3 text-center transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-center space-x-1 text-cyan-400 mb-1">
            <Star className="w-3.5 h-3.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Spotlight No.</span>
          </div>
          <div className="text-2xl font-black text-cyan-300">
            {spotlightNo}
          </div>
          <p className="text-[9px] text-cyan-400/70 mt-0.5">Stage Challenge</p>
        </div>
      </div>
    </div>
  );
};
