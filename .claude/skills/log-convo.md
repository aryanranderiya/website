---
name: log-convo
description: Document a great AI coding session as a comprehensive agent-convos MDX entry. Run this after any technically impressive conversation — multi-agent orchestration, production debugging, browser automation, autonomous execution, or any session where something genuinely novel happened. Creates a full blog-post-style entry in src/content/agent-convos/.
triggers:
  - "log-convo"
  - "log this conversation"
  - "document this session"
  - "write up this convo"
  - "add to agent convos"
---

# /log-convo — Document an Agent Conversation

Run this skill after a technically impressive coding session to capture it as a permanent, well-written entry in the agent-convos collection of the portfolio repo.

The portfolio repo always lives at `/Users/aryan/Projects/Web/portfolio/website`. This skill works from **any** cwd — it reads conversation history from `~/.claude/projects/`, writes the MDX file at the absolute portfolio path, and commits + asks before pushing in that repo (not in whatever repo Claude was launched from).

This file is the single source of truth for the skill. The global skill at `~/.claude/skills/log-convo/SKILL.md` is a symlink to this file, so any edits here propagate to the global skill automatically.

---

## Step 1: Locate the conversation JSONL

Claude Code stores every session as a JSONL file. **All metrics in this skill MUST be derived from the JSONL**, never estimated, never guessed. Two locations exist:

- `/Users/aryan/.claude/projects/` — Mac-side sessions (most projects)
- `/home/aryan/.claude/projects/` — VM-side sessions (cc2 OrbStack invocations)

Project paths are encoded by replacing `/` with `-`. Find the right session JSONL by matching `cwd` and timestamp:

```bash
# All JSONLs across both stores
find /Users/aryan/.claude/projects /home/aryan/.claude/projects -name '*.jsonl' 2>/dev/null

# Find sessions whose cwd matches a project, ordered by start time
for f in $(find /Users/aryan/.claude/projects /home/aryan/.claude/projects -name '*.jsonl' 2>/dev/null); do
  CWD=$(jq -r 'select(.cwd) | .cwd' "$f" 2>/dev/null | head -1)
  TS=$(jq -r 'select(.timestamp) | .timestamp' "$f" 2>/dev/null | head -1)
  echo -e "$TS\t$CWD\t$f"
done | sort
```

The CURRENT session's JSONL is the one most-recently modified in `~/.claude/projects/<encoded-cwd>/`.

If the user describes the conversation in chat without giving a session, ask them to paste the slug or session ID, or look up by date + project.

---

## Step 2: Extract EXACT metrics from the JSONL

**No estimates. No `~` prefix. No round numbers if exact ones are available.** Every numeric field below has a deterministic extraction. Run the extraction RIGHT BEFORE Step 6 (commit), not at Step 1, so the snapshot is final-as-of-commit-time. The session keeps growing while you write the entry.

### Net token methodology (current convention — use this)

Every assistant message in the JSONL has a `.message.usage` object with:
- `input_tokens` — new uncached input
- `output_tokens` — model output
- `cache_creation_input_tokens` — content cached for the first time this call
- `cache_read_input_tokens` — content read from prompt cache (DO NOT include — these are repeats of the same context, dominate by 10-100×, and overstate the work done)

**Net tokens = input + output + cache_creation.** This is the closest measure of unique work performed. Cache reads are excluded because the same conversation context is re-loaded every turn — including them inflates a 4M-token session to 90M.

```bash
# tokenCount + breakdown (run on the right JSONL)
JSONL=<path>
jq -r 'select(.message.usage) | "\(.message.usage.input_tokens // 0)\t\(.message.usage.output_tokens // 0)\t\(.message.usage.cache_read_input_tokens // 0)\t\(.message.usage.cache_creation_input_tokens // 0)"' $JSONL \
  | awk 'BEGIN{i=0;o=0;cr=0;cc=0;n=0} {i+=$1;o+=$2;cr+=$3;cc+=$4;n++} END{
      net = i+o+cc;
      printf "tokenCount (net):  %d\n", net;
      printf "tokens (string):   %.2fM\n", net/1000000;
      printf "  input:           %d\n", i;
      printf "  output:          %d\n", o;
      printf "  cache_creation:  %d\n", cc;
      printf "  cache_read:      %d (excluded)\n", cr;
      printf "API calls:         %d\n", n;
    }'
```

Format `tokens` as `X.XM` (always one decimal, no trailing zeros eaten — e.g. `4.6M`, `41.9M`, `1.7M`). For sessions under 100K tokens, format as `XXk` (e.g. `87k`).

### Duration (exact)

```bash
JSONL=<path>
START=$(jq -r 'select(.timestamp) | .timestamp' $JSONL | head -1)
END=$(jq -r 'select(.timestamp) | .timestamp' $JSONL | tail -1)
DIFF=$(( $(date -d "$END" +%s) - $(date -d "$START" +%s) ))
H=$((DIFF / 3600)); M=$(( (DIFF % 3600) / 60 )); S=$((DIFF % 60))
echo "${H}h ${M}m ${S}s"
```

Format as `XXh XXm XXs` for sessions over an hour, `XXm XXs` under. Never `~`. Never "overnight" — give the exact span.

### Message count (exact)

```bash
USER=$(jq -r 'select(.message.role == "user") | "x"' $JSONL | wc -l)
ASST=$(jq -r 'select(.message.role == "assistant") | "x"' $JSONL | wc -l)
echo $((USER + ASST))
```

This is `messageCount`. Optionally also compute `apiCalls` = number of `.message.usage` records (often equals assistant message count but not always — tool-use round trips can vary).

### Files / lines changed (exact, from git)

For session-window git changes across N branches/worktrees:

```bash
# Per-branch session-window stats (substitute SESSION_START with the JSONL's first timestamp)
for wt in <list-of-worktree-paths>; do
  cd "$wt"
  git log --since="$SESSION_START" --no-merges --shortstat --format= 2>/dev/null \
    | awk '/files? changed/ {
        for(i=1;i<=NF;i++){
          if($i~/insertion/) add+=$(i-1);
          if($i~/deletion/) del+=$(i-1);
          if($i~/file/&&$i~/chang/) f+=$(i-1);
        }
      } END {printf "%d files +%d -%d\n", f, add, del}'
done

# Unique file count across all branches
for wt in <worktrees>; do
  cd "$wt"
  git log --since="$SESSION_START" --no-merges --name-only --format= 2>/dev/null
done | grep -v '^$' | sort -u | wc -l
```

Use the unique file count for `filesChanged`. Use `linesChanged: "+N / -N"` with thousands-separator commas.

### Other frontmatter fields

- `date`: YYYY-MM-DD of session start (from the first timestamp, in user's local TZ if needed)
- `platform`: `claude-code` | `opencode` | `codex` (verify from JSONL or harness)
- `model`: exact model ID — read from `.message.model` field of any assistant message: `jq -r 'select(.message.model) | .message.model' $JSONL | head -1`
- `harness`: exact version string. For Claude Code, look for the `version` field if present in early metadata, otherwise check `claude --version` from the appropriate host
- `agents` / `agentCount`: count distinct subagent IDs from `.subtype == "init"` task tool uses, or from `/tmp/claude-501/.../tasks/*.output` files. List each with role in parens
- `project`: from `.cwd` — derive the project name (e.g. cwd starts with `/Users/aryan/Projects/GAIA/...` → `GAIA`)
- `branch`: `cd <cwd> && git branch --show-current` at session end (or note if multiple branches)
- `sessionId`: the JSONL filename minus `.jsonl` (UUID). Add this to frontmatter so future re-derivation is trivial

### Classification

- `category`: one of `infrastructure` | `multi-agent` | `browser-automation` | `debugging` | `full-stack` | `autonomous` | `knowledge-engineering`
- `featured`: `true` if genuinely impressive (novel approach, scale, or outcome)

---

## Step 3: Write the MDX body

The body is a **blog post**, not a summary. Write it like a senior engineer telling a story to another senior engineer. Follow these rules:

### Voice and structure
- First paragraph: the problem or mission. What was broken, what needed building, why it was hard. No preamble.
- Middle: the journey. Every significant decision, debugging step, approach tried, insight reached. Be specific — tool names, file names, error messages, exact approaches. Name the commands used. Explain WHY each decision was made, not just WHAT happened.
- End: the result and what made it impressive. What was the key insight? What would this have taken a human to do?
- **Length**: aim for **1500–2500 words for long sessions** (>6 hours, >2M net tokens, multi-domain work). Shorter sessions can be 600–900 words. Never truncate important technical details. A blog post about a 12-hour build is allowed to be 2000 words.
- **Headings are encouraged for long posts.** Use **5–10 H2 (`##`) section headings** to make the post scannable and blog-readable. Each section covers one phase of the journey (the brief, the algorithm choice, the debugging, the demo, etc.). Single narrative flow only for short posts.
- **Read like a blog post**: lead each section with the problem or context for that phase, then walk through the decisions in order, then end with the result. Use specific quantitative detail liberally — file sizes, byte counts, exact percentages, timing measurements.

### What to always include
- **The user's actual prompts, quoted verbatim where they shaped the work.** Extract them from the JSONL — `jq -r 'select(.message.role == "user") | (if (.message.content | type) == "string" then .message.content elif (.message.content | type) == "array" then ([.message.content[] | select(.type == "text") | .text] | join(" ")) else "" end)' $JSONL | grep -vE '^<system-reminder|^<command-name|^Tool loaded|^Caveat'`. Block-quote them inline in the post with `> *"..."*`. Cover every directive that changed the agent's direction (the initial brief, mid-session pivots, frustration moments, scope changes, verification asks).
- The exact error messages or symptoms that triggered the session
- Every debugging hypothesis the agent formed and tested
- The specific commands, files, configs that were key — name the files by path
- Any moments where the agent made a non-obvious architectural decision
- What failed before the correct approach was found, and which approach replaced it
- For ML/data-heavy sessions: where the training data came from, how it was generated/sourced, the augmentation strategy, the architecture choice and why, the loss function, the training hyperparameters, the validation metrics
- Token count / agent count context if it helps frame the scale
- The precise fix, not just "it fixed it"
- Quantitative measurements wherever they exist: throughput before/after a perf fix, exact recall/FPR numbers, file sizes, latency numbers in ms

### What to never include
- **Fabricated details.** If you didn't see it in the JSONL, the git diff, or the file contents, don't write it. No inferring "the agent must have done X." Cross-check every claim against the actual conversation. Estimates are unacceptable; so are invented quotes, invented file names, invented commit hashes, invented metrics.
- Bullet point lists or numbered lists in the prose body. (Tables are allowed for tabular data like metric comparisons — sparingly.)
- Generic statements like "the agent did a great job"
- Vague phrases like "various issues were resolved"
- Emojis
- Repetition of the title or description
- Paraphrased prompts when verbatim quotes are available — the JSONL has the user's actual words, use them.

### Tone examples

**Too vague:**
> The agent debugged a streaming issue involving state management.

**Good:**
> The Zustand store had a stale closure problem. The SSE event handler captured a reference to the store's `messages` array at connection establishment time. When the second message arrived, it appended to the old snapshot — the store technically updated, but React's reconciliation engine saw no change in reference identity and skipped the re-render. The IndexedDB write succeeded because it called `getState()` directly, which is why a page reload surfaced the messages. The fix: restructure the handler to call `setState` with a fresh array built from `getState().messages` rather than the captured closure value.

---

## Step 4: Generate the slug

Create a slug from the title: lowercase, hyphens only, descriptive, max 5 words.
Examples: `streaming-architecture-debug`, `13-agent-heroui-swarm`, `cicd-ssh-credential-boundary`

---

## Step 5: Write the file

Always write to the **absolute** path so the skill works regardless of cwd:

```
/Users/aryan/Projects/Web/portfolio/website/src/content/agent-convos/<slug>.mdx
```

Full MDX structure:

```mdx
---
title: "..."
description: "One sentence. Technically specific. What happened and why it's impressive."
date: YYYY-MM-DD
platform: claude-code
model: claude-sonnet-4-6
harness: "Claude Code v2.1.92"
category: debugging
featured: false
tokens: "4.6M"
tokenCount: 4602952
apiCalls: 637
messageCount: 1065
duration: "13h 28m 33s"
filesChanged: 41
linesChanged: "+2,891 / -4,309"
agents: []
agentCount: 0
project: "GAIA"
branch: "feat/my-branch"
sessionId: "2bced3e5-6417-49c4-85a6-dd6d026a1cd2"
---

[Body text — prose blog post, no bullet points, 400-700 words]
```

The token convention is **net** (input + output + cache_creation, excluding cache_read). Older entries used sum-of-flow (including cache_read) and so report inflated token counts; new entries use net for honesty about unique work performed.

---

## Step 6: Commit and push to the portfolio repo

The portfolio is a separate git repo from whatever project the conversation was about. Always run these from the portfolio working tree, **not** the cwd Claude was launched in.

```bash
cd /Users/aryan/Projects/Web/portfolio/website
git add src/content/agent-convos/<slug>.mdx
git commit -m "convos: add <slug>"
```

After the commit, **stop and ask the user once for confirmation before pushing**. Show the slug and a one-line summary of the entry, then run `git push` only after they say yes. Do not push autonomously, and do not bundle the push into the same tool call as the commit.

If `git status` in the portfolio shows unrelated dirty files, only stage the new MDX — never `git add -A`.

---

## Checklist before writing

- [ ] **Located the source JSONL** under `/Users/aryan/.claude/projects/` or `/home/aryan/.claude/projects/`
- [ ] **`sessionId` recorded in frontmatter** (UUID from JSONL filename) — enables future re-derivation
- [ ] **All numeric fields extracted from JSONL/git, never estimated**. No `~` prefix anywhere. No round numbers if exact ones exist.
- [ ] **Token snapshot taken RIGHT BEFORE commit**, not at writing time — the session keeps growing while you draft
- [ ] **`tokenCount` uses NET methodology** (input + output + cache_creation, NOT cache_read). Cache reads dominate by 10-100× and overstate work.
- [ ] **`tokens` formatted as `X.XM` or `XXk`** — one decimal, no unit ambiguity (never `MB`)
- [ ] **`duration` is exact `XXh XXm XXs`** computed from first/last JSONL timestamps. No `~`, no "overnight."
- [ ] **`messageCount` is exact** count of `.message.role == user|assistant` entries
- [ ] **`filesChanged` is unique-file count** from session-window git log across all touched worktrees
- [ ] **`linesChanged` is exact `+N / -N`** from session-window `git log --shortstat`
- [ ] **`model` is the exact ID** from `.message.model` field, not memory
- [ ] **All agent names include role in parens**
- [ ] Description is one sentence, technically specific
- [ ] Body has no bullet points or numbered lists
- [ ] Body names specific files, commands, error messages, exact line counts
- [ ] Body explains the WHY behind every decision
- [ ] Slug is lowercase, hyphens only, max 5 words
- [ ] File created at `/Users/aryan/Projects/Web/portfolio/website/src/content/agent-convos/<slug>.mdx`
- [ ] Committed from inside `/Users/aryan/Projects/Web/portfolio/website` with message `convos: add <slug>`
- [ ] Asked the user before pushing — never auto-pushed

## Hard rules

**Never write a number you didn't compute from the JSONL or git in the last 60 seconds.** If you can't extract it, omit the field — don't fill with a guess. The user has explicitly said: estimates are unacceptable.

**Never fabricate a quote, file path, error message, or commit hash.** Every direct quote in the body must come from the JSONL. Every file path must exist in the git diff. Every error message must appear in the conversation. If you can't ground a claim, drop the claim — don't paper over it with plausible-sounding fiction.

**Long sessions deserve long posts.** A 12-hour multi-domain build with a 6M-token transcript is a 2000-word blog post, not a 500-word summary. Cover each phase as its own H2 section so the reader can follow the arc.
