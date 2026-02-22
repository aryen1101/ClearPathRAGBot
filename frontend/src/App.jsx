import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from './store/useChatStore';
import { ChatMessage } from './components/ChatMessage';
import { Inspector } from './components/Inspector';
import { Send, Trash2, Activity } from 'lucide-react';
import logo from './assets/logo.jpeg';

export default function App() {
  const { messages, askQuestion, loading, selectedData, setSelectedData, clearSession } = useChatStore();
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  // Smooth scroll to the latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    askQuestion(input);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-[#0b141a] p-4 lg:p-6 gap-4 font-sans antialiased text-slate-200">

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-[#121b22] border border-emerald-900/20 rounded-[28px] shadow-2xl overflow-hidden relative">

        {/* Header with New Logo */}
        <header className="px-8 py-5 border-b border-emerald-900/20 flex justify-between items-center bg-[#121b22]/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <img src={logo} alt="CP Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-white leading-none">
                ClearPath <span className="text-emerald-500">Support</span>
              </h1>
            </div>
          </div>
          <button
            onClick={clearSession}
            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            title="Clear Conversation"
          >
            <Trash2 size={18} />
          </button>
        </header>

        {/* Chat Body - Hidden Scrollbar Applied */}
        <main className="flex-1 overflow-y-auto px-8 py-8 space-y-2 no-scrollbar scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl overflow-hidden mb-6 opacity-20 grayscale border border-emerald-500/50">
                <img src={logo} alt="ClearPath" className="w-full h-full object-cover" />
              </div>
              <p className="text-emerald-100/40 text-sm font-medium tracking-wide">
                Ready to help with company policies and GPS plans.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} onSelect={setSelectedData} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.2em] mt-6 ml-14 animate-pulse">
              <Activity size={12} />
              Consulting Vector Database...
            </div>
          )}
          <div ref={endRef} />
        </main>

        {/* Input Area */}
        <footer className="p-6 bg-[#121b22]">
          <div className="max-w-3xl mx-auto relative flex gap-3 items-center">
            <div className="flex-1 relative group">
              <input
                className="w-full bg-[#1e2a33] border border-emerald-900/10 rounded-2xl pl-6 pr-6 py-4 outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-[15px] text-white placeholder-slate-500 shadow-inner"
                placeholder="Ask me about ClearPath GPS..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg shrink-0 ${
                loading
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/40'
              }`}
            >
              <Send size={20} fill={!loading ? "currentColor" : "none"} />
            </button>
          </div>
        </footer>
      </div>

      {/* Right Sidebar: Technical Inspector */}
      <aside className="w-96 bg-[#121b22] border border-emerald-900/20 rounded-[28px] shadow-2xl overflow-hidden hidden xl:flex flex-col">
        <div className="p-6 border-b border-emerald-900/20 bg-[#121b22]/50">
          <h2 className="font-bold text-emerald-100 text-[11px] flex items-center gap-2 tracking-[0.15em] uppercase">
            <Activity size={14} className="text-emerald-500" /> Technical Trace
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <Inspector data={selectedData} />
        </div>
      </aside>
    </div>
  );
}