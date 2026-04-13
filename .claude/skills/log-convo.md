---
name: log-convo
description: Document a great AI coding session as a comprehensive agent-convos MDX entry for this portfolio. Run after any technically impressive Claude Code, OpenCode, or Codex CLI session. Creates src/content/agent-convos/<slug>.mdx with full prose blog post body.
triggers:
  - "log-convo"
  - "log this conversation"
  - "document this session"
  - "add to agent convos"
---

# /log-convo — Log a Conversation to Agent Convos

See the global skill at `~/.claude/skills/log-convo/SKILL.md` for full instructions.

## Quick reference for this project

**Output path:** `src/content/agent-convos/<slug>.mdx`

**Content collection schema** (from `src/content/config.ts`):
- `platform`: `claude-code` | `opencode` | `codex`
- `category`: `infrastructure` | `multi-agent` | `browser-automation` | `debugging` | `full-stack` | `autonomous` | `knowledge-engineering`
- `tokens`: string, NO `~` prefix — derive from `tokenCount` if available
- `tokenCount`: exact integer
- `agents`: string array — include role in parens, e.g. `"Euler (explorer)"`

**Finding the conversation JSONL:**
```bash
# Find conversations for this project:
ls ~/.claude/projects/ | grep portfolio
# Or search by recency:
ls -lt ~/.claude/projects/*/ | head -20
```

**Body writing rules:**
- Prose only — no bullet points, no numbered lists
- 400–700 words
- Name specific files, commands, error messages
- Explain every debugging decision and why it was made
- End with what made it technically impressive
