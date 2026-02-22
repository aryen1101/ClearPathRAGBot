import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, Cpu, Zap, Clock, Database, Coins, BarChart3 } from 'lucide-react';
import { SourceCard } from './SourceCard';

export const Inspector = ({ data }) => {
  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
      <div className="w-16 h-16 bg-[#121b22] rounded-full flex items-center justify-center text-emerald-900 shadow-inner border border-emerald-900/20">
        <Database size={28} />
      </div>
      <p className="text-slate-500 text-sm font-medium italic">
        Select a chat bubble to inspect <br/> the RAG metadata.
      </p>
    </div>
  );

  const { metadata, sources } = data;

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 bg-[#0b141a] h-full border-l border-emerald-900/20">
      {/* SECTION: PERFORMANCE STATS */}
      <section>
        <h3 className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <BarChart3 size={12} /> Pipeline Metrics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatBox icon={<Cpu size={14}/>} label="Router" val={metadata.classification} />
          <StatBox icon={<Zap size={14}/>} label="Model" val={metadata.model_used} />
          <StatBox icon={<Clock size={14}/>} label="Latency" val={`${metadata.latency_ms}ms`} />
          <StatBox icon={<Activity size={14}/>} label="Chunks" val={metadata.chunks_retrieved} />
        </div>
      </section>

      {/* SECTION: TOKEN USAGE (REFINED) */}
      <section>
        <h3 className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Coins size={12} className="text-emerald-400" /> Token Usage
        </h3>
        <div className="bg-[#121b22] border border-emerald-900/30 rounded-2xl p-4 space-y-3 shadow-lg">
          <TokenRow label="Input Tokens" val={metadata.tokens.input} />
          <TokenRow label="Output Tokens" val={metadata.tokens.output} />

        </div>
      </section>

      {/* SECTION: CONTEXT SOURCES */}
      <section>
        <h3 className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-4">Retrieved Knowledge</h3>
        <div className="space-y-3">
          {sources.map((s, i) => (
            <div key={i} className="p-3 bg-[#121b22] border border-emerald-900/20 rounded-xl">
               <div className="flex justify-between text-[10px] mb-2 font-bold">
                  <span className="text-emerald-100/80 truncate w-40">{s.document}</span>
                  <span className="text-emerald-400">{(s.relevance_score * 100).toFixed(0)}%</span>
               </div>
               <div className="h-1 w-full bg-[#1e2a33] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${s.relevance_score * 100}%`}} />
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatBox = ({ icon, label, val }) => (
  <div className="p-3 bg-[#121b22] border border-emerald-900/20 rounded-2xl shadow-sm">
    <div className="text-emerald-500 mb-2">{icon}</div>
    <p className="text-[9px] font-bold text-slate-500 uppercase">{label}</p>
    <p className="text-xs font-black text-emerald-50 truncate">{val}</p>
  </div>
);

const TokenRow = ({ label, val }) => (
  <div className="flex justify-between text-[11px]">
    <span className="text-slate-400">{label}</span>
    <span className="font-mono font-bold text-emerald-100">{val}</span>
  </div>
);