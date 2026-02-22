import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from './store/useChatStore';
import { ChatMessage } from './components/ChatMessage';
import { Inspector } from './components/Inspector';
import { Send, Trash2, MessageSquare, ShieldCheck, Activity } from 'lucide-react';

export default function App() {
  const { messages, askQuestion, loading, selectedData, setSelectedData, clearSession } = useChatStore();
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    askQuestion(input);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-[#0b141a] p-4 lg:p-6 gap-4 font-sans antialiased text-slate-200">
      <div className="flex-1 flex flex-col bg-[#121b22] border border-emerald-900/20 rounded-[28px] shadow-2xl overflow-hidden relative">
        <header className="px-8 py-5 border-b border-emerald-900/20 flex justify-between items-center bg-[#121b22]/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <MessageSquare size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-white leading-none">ClearPath <span className="text-emerald-500">Support</span></h1>

            </div>
          </div>
          <button onClick={clearSession} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <Trash2 size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8 space-y-2 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale-[0.5]">
              <MessageSquare size={60} className="text-emerald-500 mb-4" />
              <p className="text-emerald-100 text-sm font-medium">No messages yet. Ask about company policies.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} onSelect={setSelectedData} />
          ))}
          {loading && <div className="text-emerald-500 font-black text-[9px] uppercase tracking-[0.2em] mt-4 ml-14 animate-pulse">Consulting Vector Database...</div>}
          <div ref={endRef} />
        </main>

        <footer className="p-6 bg-[#121b22]">
          <div className="max-w-3xl mx-auto relative flex gap-3 items-center">
            <div className="flex-1 relative group">
                <input
                  className="w-full bg-[#1e2a33] border border-emerald-900/10 rounded-2xl pl-6 pr-6 py-4 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-[15px] text-white placeholder-slate-500 shadow-inner"
                  placeholder="Type a query..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
            </div>
            <button
              onClick={handleSend}
              className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-500 transition-all active:scale-90 shadow-lg shadow-emerald-900/40 shrink-0"
            >
              <Send size={20} fill="currentColor" />
            </button>
          </div>
        </footer>
      </div>

      <aside className="w-96 bg-[#121b22] border border-emerald-900/20 rounded-[28px] shadow-2xl overflow-hidden hidden xl:flex flex-col">
        <div className="p-6 border-b border-emerald-900/20">
          <h2 className="font-bold text-emerald-100 text-sm flex items-center gap-2 tracking-tight uppercase">
            <Activity size={16} className="text-emerald-500" /> Technical Trace
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Inspector data={selectedData} />
        </div>
      </aside>
    </div>
  );
}