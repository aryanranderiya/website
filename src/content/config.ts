import { defineCollection, z } from 'astro:content';

// Blog posts
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().default('blog'),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

// Projects
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    tech: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    video: z.string().optional(),
    url: z.string().url().optional(),
    github: z.string().url().optional(),
    featured: z.boolean().default(false),
    type: z.enum(['mobile', 'web', 'os', 'design', 'other', 'cli', 'game', 'desktop']).default('web'),
    folder: z.string().default('Projects'),
    coverImage: z.string().optional(),
    status: z.enum(['completed', 'in-progress', 'archived']).default('completed'),
    order: z.number().default(99),
  }),
});

// Books
const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    cover: z.string().optional(), // URL or local path
    status: z.enum(['read', 'reading', 'to-read']),
    rating: z.number().min(0).max(5).optional(),
    review: z.string().optional(),
    genre: z.array(z.string()).default([]),
    year: z.number().optional(),
    pages: z.number().optional(),
    isbn: z.string().optional(),
    dateRead: z.coerce.date().optional(),
    featured: z.boolean().default(false),
  }),
});

// Movies
const movies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.number(),
    cover: z.string().optional(), // poster URL
    imdbId: z.string().optional(),
    myRating: z.number().min(0).max(10).optional(),
    status: z.enum(['watched', 'watchlist']),
    review: z.string().optional(),
    thoughts: z.string().optional(), // pre-watch thoughts
    favCharacters: z.array(z.string()).default([]),
    genre: z.array(z.string()).default([]),
    director: z.string().optional(),
    dateWatched: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    rewatched: z.boolean().default(false),
  }),
});

// Now page entries
const now = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    location: z.string().optional(),
  }),
});

// Agent conversations — impressive agentic coding sessions
const agentConvos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // Platform & tooling
    platform: z.enum(['claude-code', 'opencode', 'codex']),
    model: z.string(), // e.g. "claude-sonnet-4", "gpt-5.4", "gemini-2.5-pro"
    harness: z.string(), // e.g. "Claude Code v1.0.12", "OpenCode v1.4.3", "Codex CLI v0.118.0"
    // Classification
    category: z.enum(['infrastructure', 'multi-agent', 'browser-automation', 'debugging', 'full-stack', 'autonomous', 'knowledge-engineering']),
    featured: z.boolean().default(false),
    // Session metrics
    tokens: z.string().optional(), // human-readable e.g. "75M", "41.9M"
    tokenCount: z.number().optional(), // raw number for sorting
    messageCount: z.number().optional(),
    duration: z.string().optional(), // e.g. "~4 hours", "overnight"
    filesChanged: z.number().optional(),
    linesChanged: z.string().optional(), // e.g. "+1,200 / -340"
    // Multi-agent metadata
    agents: z.array(z.string()).default([]),
    agentCount: z.number().optional(),
    // Context
    project: z.string().optional(), // e.g. "GAIA", "Portfolio", "On-Call Assist"
    repo: z.string().optional(), // github repo if public
    branch: z.string().optional(),
  }),
});

export const collections = {
  blog,
  projects,
  books,
  movies,
  now,
  'agent-convos': agentConvos,
};
