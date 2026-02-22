import React from 'react';
import { Bot, User, ShieldCheck, Zap } from 'lucide-react';

export const ChatMessage = ({ message, onSelect }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 group animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className={`relative flex gap-4 max-w-[90%] transition-transform group-hover:scale-[1.01] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 ${
          isUser
          ? 'bg-emerald-600 text-white rotate-3 group-hover:rotate-0'
          : 'bg-slate-800 text-emerald-400 border border-emerald-500/30 -rotate-3 group-hover:rotate-0'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        <div
          onClick={() => !isUser && onSelect(message)}
          className={`relative overflow-hidden p-5 rounded-[24px] border transition-all duration-300 ${
            isUser
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-50 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.1)]'
            : 'bg-slate-900/60 border-slate-700/50 text-slate-200 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/80 shadow-xl'
          }`}
        >
          {!isUser && (
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
          )}

          <p className="text-[15px] leading-relaxed font-medium selection:bg-emerald-500/30">
            {message.content}
          </p>


        </div>
      </div>
    </div>
  );
};