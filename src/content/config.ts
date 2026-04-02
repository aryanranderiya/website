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
    type: z.enum(['mobile', 'web', 'os', 'design', 'other']).default('web'),
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

export const collections = {
  blog,
  projects,
  books,
  movies,
};
