'use client';

import './message-bubble.css';

import { ArrowUp02Icon, Cancel01Icon, ChatBotIcon, HugeiconsIcon } from '@icons';
import { AnimatePresence, LazyMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FOLLOWUP_SYSTEM_PROMPT, SUGGESTED_QUESTIONS } from '@/data/ai-context';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

// Prompt is fetched lazily from /api/ai-prompt.json when the chat first opens,
// keeping it out of the HTML payload entirely.
let _cachedPrompt = '';

const MODEL_ID = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

// ─── Module-level singleton ───────────────────────────────────────────────────
// Lives outside React - survives Astro View Transition page remounts.
let _engine: {
	chat: { completions: { create: (opts: Record<string, unknown>) => Promise<unknown> } };
} | null = null;
let _engineReady = false;
let _engineError = '';
let _initPromise: Promise<void> | null = null;

async function getEngine(
	onProgress: (text: string) => void,
	onReady: () => void,
	onError: (msg: string) => void
) {
	if (_engineReady && _engine) {
		onReady();
		return;
	}
	if (_engineError) {
		onError(_engineError);
		return;
	}
	if (_initPromise) {
		await _initPromise;
		_engineReady ? onReady() : onError(_engineError);
		return;
	}

	if (typeof navigator === 'undefined' || !('gpu' in navigator) || !navigator.gpu) {
		_engineError = 'WebGPU is not supported. Try Chrome 113+ or Edge.';
		onError(_engineError);
		return;
	}

	_initPromise = (async () => {
		try {
			onProgress('Starting...');
			const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
			_engine = (await CreateMLCEngine(MODEL_ID, {
				initProgressCallback: (prog: { text?: string }) => {
					const text: string = prog?.text ?? '';
					const pct = text.match(/(\d+\.?\d*)%/)?.[1];
					onProgress(pct ? `Downloading ${pct}%` : text.slice(0, 50) || 'Loading...');
				},
			})) as unknown as typeof _engine;
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
				<m.span
					key={i}
					className="h-1.5 w-1.5 rounded-full bg-current"
					animate={{ opacity: [0.3, 0.8, 0.3] }}
					transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
				/>
			))}
		</div>
	);
}

function UserBubble({ content }: { content: string }) {
	return (
		<div className="mb-2 flex justify-end">
			<div className="imessage-bubble imessage-from-me break-words">
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
		<div className="mb-2 flex flex-col items-start">
			<div className="imessage-bubble imessage-from-them break-words">
				{content ? (
					<>
						<p className="whitespace-pre-wrap">{content}</p>
						{isStreaming && (
							<m.span
								className="ml-0.5 inline-block h-[13px] w-0.5 bg-current align-middle opacity-60"
								animate={{ opacity: [0.6, 0] }}
								transition={{ duration: 0.5, repeat: Infinity }}
							/>
						)}
					</>
				) : isStreaming ? (
					<TypingDots />
				) : null}
			</div>

			{/* Follow-up chips - appear below the bubble after streaming ends */}
			<AnimatePresence>
				{!isStreaming && followUps && followUps.length > 0 && (
					<m.div
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
						className="mt-2 flex flex-wrap gap-1.5 pl-1"
					>
						{followUps.map((q) => (
							<button
								type="button"
								key={q}
								onClick={() => onFollowUp?.(q)}
								className="cursor-pointer rounded-full border-[1.5px] border-[rgba(0,0,0,0.22)] border-dashed px-2.5 py-1 text-[11px] text-[rgba(0,0,0,0.5)] leading-[1.4] tracking-[-0.01em] transition-colors hover:bg-black/5"
							>
								{q}
							</button>
						))}
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default function AIChat() {
	const [activePrompt, setActivePrompt] = useState(_cachedPrompt);
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
	}, []);

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
		if (!isOpen || _cachedPrompt) return;
		fetch('/api/ai-prompt.json')
			.then((r) => r.json())
			.then((data: { prompt?: string }) => {
				_cachedPrompt = data.prompt ?? '';
				setActivePrompt(_cachedPrompt);
			})
			.catch(() => {}); // non-critical — chat still works without the detailed context
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		getEngine(
			(text) => setLoadProgress(text),
			() => {
				setIsModelReady(true);
				setLoadProgress('');
			},
			(msg) => {
				setLoadError(msg);
				setLoadProgress('');
			}
		);
	}, [isOpen]);

	const generateFollowUps = useCallback(async (userQ: string, aiAnswer: string, msgId: string) => {
		if (!_engine) return;
		setIsGeneratingFollowUps(true);
		try {
			const res = (await _engine.chat.completions.create({
				messages: [
					{ role: 'system', content: FOLLOWUP_SYSTEM_PROMPT },
					{
						role: 'user',
						content: `User asked: "${userQ}"\nAI answered: "${aiAnswer.slice(0, 300)}"`,
					},
				],
				max_tokens: 100,
				temperature: 0.85,
			})) as { choices: { message: { content?: string } }[] };
			const raw = res.choices[0]?.message?.content ?? '[]';
			const parsed = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] ?? '[]') as string[];
			const followUps = parsed
				.slice(0, 3)
				.filter((s: unknown) => typeof s === 'string') as string[];
			setMessages((prev: Message[]) =>
				prev.map((m: Message) => (m.id === msgId ? { ...m, followUps } : m))
			);
		} catch {
			// silently skip - follow-ups are non-critical
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
				const chunks = (await _engine?.chat.completions.create({
					messages: [
						{ role: 'system', content: activePrompt },
						...history,
						{ role: 'user', content: text.trim() },
					],
					stream: true,
					temperature: 0.7,
					max_tokens: 350,
				})) as AsyncIterable<{ choices: { delta: { content?: string } }[] }>;

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
						m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.' } : m
					)
				);
			} finally {
				setIsStreaming(false);
				if (fullResponse) {
					generateFollowUps(text.trim(), fullResponse, assistantId);
				}
			}
		},
		[isStreaming, isModelReady, messages, generateFollowUps, activePrompt]
	);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		sendMessage(input);
	};

	const canSend = input.trim().length > 0 && isModelReady && !isStreaming;

	return (
		<LazyMotion features={loadFeatures}>
			<m.div
				className="fixed right-6 bottom-6 overflow-hidden"
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
				<m.div
					className="absolute inset-0"
					animate={{ backgroundColor: isOpen ? 'var(--background)' : '#00bbff' }}
					transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
				/>

				{/* FAB */}
				<AnimatePresence>
					{!isOpen && (
						<m.button
							key="fab"
							className="absolute inset-0 flex cursor-pointer items-center justify-center"
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
						</m.button>
					)}
				</AnimatePresence>

				{/* Chat panel */}
				<AnimatePresence>
					{isOpen && (
						<m.div
							key="chat"
							className="absolute inset-0 flex flex-col"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ delay: 0.12, duration: 0.2 }}
						>
							{/* Header */}
							<div className="flex shrink-0 items-center justify-between border-[rgba(0,0,0,0.06)] border-b px-4 py-3">
								<div className="flex items-center gap-2">
									<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00bbff]">
										<HugeiconsIcon icon={ChatBotIcon} size={14} color="white" />
									</div>
									<div>
										<p className="font-[550] text-[13px] text-[var(--foreground)] leading-none tracking-[-0.02em]">
											Ask about Aryan
										</p>
										<p className="mt-0.5 text-[11px] text-[rgba(0,0,0,0.35)]">
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
									type="button"
									onClick={() => setIsOpen(false)}
									className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/6"
									aria-label="Close chat"
								>
									<HugeiconsIcon icon={Cancel01Icon} size={14} color="rgba(0,0,0,0.45)" />
								</button>
							</div>

							{/* Messages */}
							<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 py-3">
								{messages.map((msg: Message) => (
									<m.div
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
									</m.div>
								))}

								{/* Model loading bubble */}
								{!isModelReady && !loadError && (
									<m.div
										initial={{ opacity: 0, y: 4 }}
										animate={{ opacity: 1, y: 0 }}
										className="mb-2 flex justify-start"
									>
										<div className="imessage-bubble imessage-from-them max-w-[85%]">
											<div className="mb-1.5 flex items-center gap-2">
												<m.div
													className="h-3 w-3 shrink-0 rounded-full border-[#00bbff] border-[1.5px] border-t-transparent"
													animate={{ rotate: 360 }}
													transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
												/>
												<span className="text-[12px] opacity-80">
													{loadProgress || 'Loading model...'}
												</span>
											</div>
											<div className="mb-1.5 h-px overflow-hidden rounded-full bg-[rgba(0,0,0,0.08)]">
												<m.div
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
									</m.div>
								)}

								{loadError && (
									<m.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="mb-2 flex justify-start"
									>
										<div className="imessage-bubble imessage-from-them text-[12px] text-[rgba(200,50,50,0.85)]">
											{loadError}
										</div>
									</m.div>
								)}

								<div ref={messagesEndRef} />
							</div>

							{/* Initial suggestion chips */}
							<AnimatePresence>
								{showInitialSuggestions && isModelReady && (
									<m.div
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 4 }}
										transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
										className="flex shrink-0 flex-wrap gap-1.5 px-4 pb-2"
									>
										{SUGGESTED_QUESTIONS.map((q) => (
											<button
												type="button"
												key={q}
												onClick={() => sendMessage(q)}
												className="cursor-pointer rounded-full border-[1.5px] border-[rgba(0,0,0,0.22)] border-dashed px-2.5 py-1 text-[11.5px] text-[rgba(0,0,0,0.55)] leading-[1.4] tracking-[-0.01em] transition-colors hover:bg-black/5"
											>
												{q}
											</button>
										))}
									</m.div>
								)}
							</AnimatePresence>

							{/* Input */}
							<div className="shrink-0 border-[rgba(0,0,0,0.06)] border-t px-3 pt-2 pb-3">
								<form
									onSubmit={handleSubmit}
									className="relative flex items-center rounded-full bg-[rgba(0,0,0,0.05)]"
								>
									<input
										ref={inputRef}
										type="text"
										value={input}
										onChange={(e) => setInput(e.target.value)}
										placeholder={isModelReady ? 'Ask anything...' : 'Loading model...'}
										disabled={!isModelReady || isStreaming}
										className="w-full rounded-full border-none bg-transparent py-2.5 pr-11 pl-4 text-[13px] text-[var(--foreground)] tracking-[-0.01em] shadow-none outline-none transition-opacity focus:outline-none focus:ring-0 disabled:opacity-40"
									/>
									<m.button
										type="submit"
										disabled={!canSend}
										className="absolute right-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-30"
										style={{ background: '#00bbff' }}
										whileHover={canSend ? { scale: 1.08 } : {}}
										whileTap={canSend ? { scale: 0.92 } : {}}
										aria-label="Send message"
									>
										<HugeiconsIcon icon={ArrowUp02Icon} size={16} color="white" />
									</m.button>
								</form>
							</div>
						</m.div>
					)}
				</AnimatePresence>
			</m.div>
		</LazyMotion>
	);
}
