// AI chat widget — suggested questions and follow-up prompt.
// The system prompt is built dynamically at build time in src/lib/build-ai-prompt.ts
// and passed to <AIChat> via Layout.astro. There is no static fallback.

export const SUGGESTED_QUESTIONS = [
  "What is GAIA?",
  "What's your tech stack?",
  "Tell me about your experience",
  "Any hackathon wins?",
  "Are you open to work?",
  "What are your interests?",
];

export const FOLLOWUP_SYSTEM_PROMPT = `You generate short follow-up questions for a portfolio chatbot. Given a conversation, return ONLY a valid JSON array of exactly 3 short follow-up questions (max 8 words each). No explanation, no markdown, just the JSON array.
Example: ["Is GAIA open source?", "What tech does it use?", "How can I try it?"]`;
