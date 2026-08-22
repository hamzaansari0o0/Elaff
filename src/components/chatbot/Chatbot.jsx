'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';

const GREETING = "Hi! I'm the Elaff assistant. Ask me anything about our products or trade services.";
const SESSION_STORAGE_KEY = 'elaff_chat_session_id';

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: GREETING }]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const sessionIdRef = useRef('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionIdRef.current }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : data.error || 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { role: 'bot', text: reply || "I didn't quite get that." }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-5 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden origin-bottom-right transition-all duration-200 ease-out ${
          isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
        }`}
        role="dialog"
        aria-label="Chat with Elaff assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 bg-brand-navy text-white px-4 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-cta flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Elaff Assistant</p>
              <p className="text-[11px] text-slate-300 leading-tight">Usually replies instantly</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                  m.role === 'user'
                    ? 'bg-brand-cta text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                <span className="text-[12px] text-gray-400">Typing…</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 p-3 shrink-0 bg-white">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1 bg-slate-50 border border-gray-200 rounded-full text-[13px] px-4 py-2.5 text-gray-800 outline-none placeholder-gray-400 focus:border-brand-cta transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="shrink-0 w-9 h-9 rounded-full bg-brand-cta hover:bg-brand-cta-hover disabled:opacity-40 disabled:hover:bg-brand-cta text-white flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand-cta hover:bg-brand-cta-hover text-white shadow-xl flex items-center justify-center transition-all hover:scale-105"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </>
  );
}
