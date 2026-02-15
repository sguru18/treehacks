'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useProductStore from '@/store/useProductStore';

const CHAT_SESSION_KEY = 'daisy-chat-session';

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(CHAT_SESSION_KEY);
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem(CHAT_SESSION_KEY, id);
  }
  return id;
}

/* ---- Markdown-lite renderer (bold, bullets, code) ---- */
function Markdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // headers
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-gray-800 mt-2">{line.slice(4)}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-gray-800 mt-3 text-[14px]">{line.slice(3)}</h3>;
        // bullets
        if (line.match(/^[-•*]\s/)) return <p key={i} className="pl-3 before:content-['•'] before:absolute before:left-0 relative">{line.replace(/^[-•*]\s/, '')}</p>;
        // numbered
        if (line.match(/^\d+\.\s/)) return <p key={i} className="pl-3">{line}</p>;
        // blank
        if (!line.trim()) return <div key={i} className="h-1" />;
        // bold inline
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>');
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}

/* ---- Suggested questions ---- */
function getSuggestions(board) {
  const suggestions = [];
  if (board.insights?.length) suggestions.push('What are the top pain points?');
  if (board.features?.length) suggestions.push('What should we build first and why?');
  if (board.features?.some(f => f.spec)) suggestions.push('Summarize the specs we have so far');
  if (board.roadmapItems?.length) suggestions.push('What\'s on the roadmap for sprint 1?');
  if (board.sources?.length) suggestions.push('What are customers saying about onboarding?');
  if (!suggestions.length) suggestions.push('What data should I upload to get started?');
  return suggestions.slice(0, 3);
}

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Board context
  const sources = useProductStore((s) => s.sources);
  const insights = useProductStore((s) => s.insights);
  const features = useProductStore((s) => s.features);
  const roadmapItems = useProductStore((s) => s.roadmapItems);

  const board = { sources, insights, features, roadmapItems };
  const suggestions = getSuggestions(board);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // Index board into Pinecone for RAG when opening chat (so first query can retrieve)
  useEffect(() => {
    if (!open) return;
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;
    fetch('/api/chat/index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, board }),
    }).catch((err) => console.warn('[ChatPanel] Index request failed:', err));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- index once when opening; board captured at that time

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || streaming) return;

    const userMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    // Add empty assistant message to stream into
    const assistantMsg = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const sessionId = getOrCreateSessionId();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          board,
          sessionId: sessionId || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Chat request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.content) {
              accumulated += parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: accumulated };
                return updated;
              });
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') {
              // ignore partial JSON chunks
              if (!e.message.includes('JSON')) throw e;
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry, something went wrong: ${err.message}`,
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, board]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          open ? 'bg-gray-900 text-white' : 'bg-brand-700 text-white hover:bg-brand-800'
        }`}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 right-5 z-50 w-[400px] h-[540px] bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-gray-900">Ask Daisy</p>
                <p className="text-[11px] text-gray-400">
                  {sources.length} sources · {insights.length} insights · {features.length} features
                </p>
              </div>
              <button
                onClick={() => setMessages([])}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium text-gray-800 mb-1">Ask anything about your board</p>
                  <p className="text-[11px] text-gray-400 mb-5">
                    I can see all your sources, insights, features, specs, tasks, and roadmap.
                  </p>
                  <div className="space-y-1.5 w-full">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-[12px] text-gray-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-700 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          <Markdown text={msg.content} />
                          {streaming && i === messages.length - 1 && (
                            <span className="inline-block w-1.5 h-3.5 bg-gray-400 rounded-sm ml-0.5 animate-pulse" />
                          )}
                        </>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-3 py-2 border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your product data..."
                  disabled={streaming}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  className="w-8 h-8 rounded-lg bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
                >
                  {streaming ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
