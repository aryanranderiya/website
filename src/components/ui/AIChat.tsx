'use client';

import './message-bubble.css';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon, ChatBotIcon, Cancel01Icon, ArrowUp02Icon } from '@icons';
import { SUGGESTED_QUESTIONS, FOLLOWUP_SYSTEM_PROMPT } from '@/data/ai-context';

interface AIChatProps {
  /** Dynamically built at build time from live content collections + data files. Falls back to static prompt. */
  systemPrompt?: string;
}

const MODEL_ID = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

// ─── Module-level singleton ───────────────────────────────────────────────────
// Lives outside React — survives Astro View Transition page remounts.
let _engine: any = null;
let _engineReady = false;
let _engineError = '';
let _initPromise: Promise<void> | null = null;

async function getEngine(
  onProgress: (text: string) => void,
  onReady: () => void,
  onError: (msg: string) => void,
) {
  if (_engineReady && _engine) { onReady(); return; }
  if (_engineError) { onError(_engineError); return; }
  if (_initPromise) { await _initPromise; _engineReady ? onReady() : onError(_engineError); return; }

  if (typeof navigator === 'undefined' || !('gpu' in navigator) || !navigator.gpu) {
    _engineError = 'WebGPU is not supported. Try Chrome 113+ or Edge.';
    onError(_engineError);
    return;
  }

  _initPromise = (async () => {
    try {
      onProgress('Starting...');
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      _engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (prog: any) => {
          const text: string = prog?.text ?? '';
          const pct = text.match(/(\d+\.?\d*)%/)?.[1];
          onProgress(pct ? `Downloading ${pct}%` : text.slice(0, 50) || 'Loading...');
        },
      });
      _engineReady = true;
      onReady();
    } catch {
      _engineError = 'Failed to load AI model. Please refresh and try again.';
      _initPromise = null;
      _engine = null;
      onError(_engineError);
    }
  })();

  return _initPromise;
}
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  followUps?: string[];
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! I'm Aryan's AI. Ask me anything about his work, projects, or experience.",
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-2">
      <div className="imessage-bubble imessage-from-me" style={{ wordBreak: 'break-word' }}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

function AssistantBubble({
  content,
  isStreaming,
  followUps,
  onFollowUp,
}: {
  content: string;
  isStreaming?: boolean;
  followUps?: string[];
  onFollowUp?: (q: string) => void;
}) {
  return (
    <div className="flex flex-col items-start mb-2">
      <div className="imessage-bubble imessage-from-them" style={{ wordBreak: 'break-word' }}>
        {content ? (
          <>
            <p className="whitespace-pre-wrap">{content}</p>
            {isStreaming && (
              <motion.span
                className="inline-block w-0.5 h-[13px] ml-0.5 align-middle bg-current opacity-60"
                animate={{ opacity: [0.6, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </>
        ) : isStreaming ? (
          <TypingDots />
        ) : null}
      </div>

      {/* Follow-up chips — appear below the bubble after streaming ends */}
      <AnimatePresence>
        {!isStreaming && followUps && followUps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
            className="flex flex-wrap gap-1.5 mt-2 pl-1"
          >
            {followUps.map((q) => (
              <button
                key={q}
                onClick={() => onFollowUp?.(q)}
                className="text-[11px] px-2.5 py-1 rounded-full cursor-pointer transition-colors hover:bg-black/5"
                style={{
                  border: '1.5px dashed rgba(0,0,0,0.22)',
                  color: 'rgba(0,0,0,0.5)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.4,
                }}
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AIChat({ systemPrompt }: AIChatProps) {
  const activePrompt = systemPrompt ?? '';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);
  const [loadProgress, setLoadProgress] = useState('');
  const [isModelReady, setIsModelReady] = useState(_engineReady);
  const [loadError, setLoadError] = useState(_engineError);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showInitialSuggestions = messages.length === 1 && !isStreaming;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen && isModelReady) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, isModelReady]);

  // Sync singleton state back into React on mount (handles page re-navigation)
  useEffect(() => {
    if (_engineReady) setIsModelReady(true);
    if (_engineError) setLoadError(_engineError);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    getEngine(
      (text) => setLoadProgress(text),
      () => { setIsModelReady(true); setLoadProgress(''); },
      (msg) => { setLoadError(msg); setLoadProgress(''); },
    );
  }, [isOpen]);

  const generateFollowUps = useCallback(async (userQ: string, aiAnswer: string, msgId: string) => {
    if (!_engine) return;
    setIsGeneratingFollowUps(true);
    try {
      const res = await _engine.chat.completions.create({
        messages: [
          { role: 'system', content: FOLLOWUP_SYSTEM_PROMPT },
          { role: 'user', content: `User asked: "${userQ}"\nAI answered: "${aiAnswer.slice(0, 300)}"` },
        ],
        max_tokens: 100,
        temperature: 0.85,
      });
      const raw = res.choices[0]?.message?.content ?? '[]';
      const parsed = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] ?? '[]') as string[];
      const followUps = parsed.slice(0, 3).filter((s: any) => typeof s === 'string');
      setMessages((prev: Message[]) =>
        prev.map((m: Message) => (m.id === msgId ? { ...m, followUps } : m))
      );
    } catch {
      // silently skip — follow-ups are non-critical
    } finally {
      setIsGeneratingFollowUps(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming || !isModelReady) return;

      const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text.trim() };
      const assistantId = `a-${Date.now() + 1}`;

      // Clear follow-ups from all previous assistant messages
      setMessages((prev: Message[]) => [
        ...prev.map((m: Message) => ({ ...m, followUps: undefined })),
        userMsg,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setInput('');
      setIsStreaming(true);

      let fullResponse = '';
      try {
        const history = messages.map((m: Message) => ({ role: m.role, content: m.content }));
        const chunks = await _engine.chat.completions.create({
          messages: [
            { role: 'system', content: activePrompt },
            ...history,
            { role: 'user', content: text.trim() },
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 350,
        });

        for await (const chunk of chunks) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            fullResponse += delta;
            setMessages((prev: Message[]) =>
              prev.map((m: Message) =>
                m.id === assistantId ? { ...m, content: m.content + delta } : m
              )
            );
          }
        }
      } catch {
        setMessages((prev: Message[]) =>
          prev.map((m: Message) =>
            m.id === assistantId
              ? { ...m, content: 'Something went wrong. Please try again.' }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        if (fullResponse) {
          generateFollowUps(text.trim(), fullResponse, assistantId);
        }
      }
    },
    [isStreaming, isModelReady, messages, generateFollowUps]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  const canSend = input.trim().length > 0 && isModelReady && !isStreaming;

  return (
    <motion.div
      className="fixed bottom-6 right-6 overflow-hidden"
      style={{ zIndex: 9998, transformOrigin: 'bottom right' }}
      animate={{
        width: isOpen ? 360 : 48,
        height: isOpen ? 520 : 48,
        borderRadius: isOpen ? 20 : 24,
        boxShadow: isOpen
          ? '0 16px 48px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)'
          : '0 4px 16px rgba(0,187,255,0.35)',
      }}
      transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.85 }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: isOpen ? 'var(--background)' : '#00bbff' }}
        transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
      />

      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open AI chat"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <HugeiconsIcon icon={ChatBotIcon} size={22} color="white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.12, duration: 0.2 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#00bbff' }}
                >
                  <HugeiconsIcon icon={ChatBotIcon} size={14} color="white" />
                </div>
                <div>
                  <p
                    className="text-[13px] font-[550] leading-none"
                    style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}
                  >
                    Ask about Aryan
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>
                    {isModelReady
                      ? isGeneratingFollowUps
                        ? 'Thinking...'
                        : 'Ready'
                      : loadError
                      ? 'Error'
                      : 'Loading model...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-black/6"
                aria-label="Close chat"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} color="rgba(0,0,0,0.45)" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-3 flex flex-col"
              style={{ minHeight: 0 }}
            >
              {messages.map((msg: Message) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                >
                  {msg.role === 'user' ? (
                    <UserBubble content={msg.content} />
                  ) : (
                    <AssistantBubble
                      content={msg.content}
                      isStreaming={isStreaming && msg.id === messages[messages.length - 1]?.id}
                      followUps={msg.followUps}
                      onFollowUp={sendMessage}
                    />
                  )}
                </motion.div>
              ))}

              {/* Model loading bubble */}
              {!isModelReady && !loadError && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-2"
                >
                  <div className="imessage-bubble imessage-from-them" style={{ maxWidth: '85%' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <motion.div
                        className="w-3 h-3 rounded-full border-[1.5px] border-[#00bbff] border-t-transparent shrink-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      <span className="text-[12px] opacity-80">
                        {loadProgress || 'Loading model...'}
                      </span>
                    </div>
                    <div
                      className="h-px rounded-full overflow-hidden mb-1.5"
                      style={{ background: 'rgba(0,0,0,0.08)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: '#00bbff' }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                    <p className="text-[11px] opacity-50">
                      Downloads once, loads from cache after.
                    </p>
                  </div>
                </motion.div>
              )}

              {loadError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-2"
                >
                  <div
                    className="imessage-bubble imessage-from-them text-[12px]"
                    style={{ color: 'rgba(200,50,50,0.85)' }}
                  >
                    {loadError}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Initial suggestion chips */}
            <AnimatePresence>
              {showInitialSuggestions && isModelReady && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
                  className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0"
                >
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-[11.5px] px-2.5 py-1 rounded-full cursor-pointer transition-colors hover:bg-black/5"
                      style={{
                        border: '1.5px dashed rgba(0,0,0,0.22)',
                        color: 'rgba(0,0,0,0.55)',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.4,
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div
              className="px-3 pb-3 pt-2 shrink-0"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
            >
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center rounded-full"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isModelReady ? 'Ask anything...' : 'Loading model...'}
                  disabled={!isModelReady || isStreaming}
                  className="w-full text-[13px] pl-4 pr-11 py-2.5 rounded-full outline-none focus:outline-none focus:ring-0 disabled:opacity-40 transition-opacity"
                  style={{
                    background: 'transparent',
                    color: 'var(--foreground)',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    letterSpacing: '-0.01em',
                  }}
                />
                <motion.button
                  type="submit"
                  disabled={!canSend}
                  className="absolute right-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  style={{ background: '#00bbff' }}
                  whileHover={canSend ? { scale: 1.08 } : {}}
                  whileTap={canSend ? { scale: 0.92 } : {}}
                  aria-label="Send message"
                >
                  <HugeiconsIcon icon={ArrowUp02Icon} size={16} color="white" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
