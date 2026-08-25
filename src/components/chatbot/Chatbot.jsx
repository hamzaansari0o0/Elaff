'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';

const GREETING = "Hi! I'm the Elaff assistant. Ask me anything about our products or trade services.";
const SESSION_STORAGE_KEY = 'elaff_chat_session_id';
const SWIPE_THRESHOLD = 20; // px of horizontal drag before the front/back buttons swap
// Falls back to this number when the admin hasn't set CompanySettings.whatsapp yet.
const DEFAULT_WHATSAPP_NUMBER = '923084888399';

const HINT_TEXT = {
  chat: 'Ask this AI agent to find products or get store info',
  whatsapp: 'Message our supplier directly on WhatsApp',
};

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

function buildWhatsAppLink(rawNumber, message) {
  const digits = (rawNumber || '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.05 2C6.55 2 2.1 6.45 2.1 11.95c0 1.87.51 3.63 1.4 5.13L2 22l5.05-1.33a9.9 9.9 0 004.99 1.35h.005c5.5 0 9.95-4.45 9.95-9.95S17.55 2 12.05 2zm0 18.13h-.005a8.2 8.2 0 01-4.18-1.14l-.3-.18-3.1.81.82-3.02-.2-.31a8.18 8.18 0 01-1.26-4.37c0-4.53 3.69-8.22 8.23-8.22 2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 012.41 5.81c0 4.53-3.69 8.2-8.24 8.2z" />
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.78-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}

export default function Chatbot({ whatsappNumber }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: GREETING }]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [frontButton, setFrontButton] = useState('chat'); // 'chat' | 'whatsapp' — which FAB is on top of the stack
  const [showHint, setShowHint] = useState(false);
  const sessionIdRef = useRef('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const dragStartXRef = useRef(null);
  const didSwipeRef = useRef(false);
  const fabWrapRef = useRef(null);

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

  // The "what is this button for" hint stays open until the user taps anywhere
  // outside the FAB stack — no auto-hide timer.
  useEffect(() => {
    if (!showHint) return;
    function handleOutsidePointer(e) {
      if (fabWrapRef.current && !fabWrapRef.current.contains(e.target)) {
        setShowHint(false);
      }
    }
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [showHint]);

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

  // Swipe the FAB stack left/right to bring the other button to the front. Tracked on the
  // container so a drag starting on either button (front or back) is caught — a genuine
  // drag also has to suppress that button's own click, which fires right after pointerup.
  function handlePointerDown(e) {
    dragStartXRef.current = e.clientX;
  }
  function handlePointerUp(e) {
    if (dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    dragStartXRef.current = null;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      setFrontButton((prev) => (prev === 'chat' ? 'whatsapp' : 'chat'));
      setShowHint(true);
      didSwipeRef.current = true;
    }
  }

  function handleChatClick() {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    if (frontButton !== 'chat') {
      setFrontButton('chat');
      setShowHint(true);
      return;
    }
    setShowHint(false);
    setIsOpen((v) => !v);
  }

  function handleWhatsAppClick(e) {
    if (didSwipeRef.current) {
      e.preventDefault();
      didSwipeRef.current = false;
      return;
    }
    if (frontButton !== 'whatsapp') {
      e.preventDefault();
      setFrontButton('whatsapp');
      setShowHint(true);
      return;
    }
    setShowHint(false);
  }

  const whatsappHref = buildWhatsAppLink(
    whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
    "Hi! I'd like to know more about your products."
  );

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

      {/* Swipeable FAB stack — chat + WhatsApp, drag left/right to swap which is in front */}
      <div
        ref={fabWrapRef}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 sm:w-14 sm:h-14 touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* "What is this for" hint — appears when the front button changes, stays until an outside tap.
            z-30 so it sits above the buttons (z-20/z-10), which otherwise paint over it. */}
        {showHint && (
          <div
            role="status"
            className="absolute bottom-full right-0 mb-3 z-30 w-40 sm:w-48 bg-white text-gray-700 text-[10px] sm:text-[11px] font-medium leading-snug rounded-xl px-3 py-2 shadow-xl border border-gray-100"
          >
            {HINT_TEXT[frontButton]}
            <span className="absolute -bottom-1 right-5 w-2.5 h-2.5 bg-white border-r border-b border-gray-100 rotate-45"></span>
          </div>
        )}

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          aria-label="Chat on WhatsApp"
          className={`absolute inset-0 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-xl flex items-center justify-center transition-all duration-300 ease-out ${
            frontButton === 'whatsapp'
              ? 'z-20 scale-100 translate-x-0 opacity-100'
              : 'z-10 scale-90 -translate-x-7 sm:-translate-x-9 opacity-95'
          }`}
        >
          <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>

        <button
          onClick={handleChatClick}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          className={`absolute inset-0 rounded-full bg-brand-cta hover:bg-brand-cta-hover text-white shadow-xl flex items-center justify-center transition-all duration-300 ease-out ${
            frontButton === 'chat'
              ? 'z-20 scale-100 translate-x-0 opacity-100'
              : 'z-10 scale-90 -translate-x-7 sm:-translate-x-9 opacity-95'
          }`}
        >
          {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Bot className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>
    </>
  );
}
