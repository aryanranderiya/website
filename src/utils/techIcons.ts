// Shared tech-stack icon map for React components (mirrors TechStack.astro).
// Returns a devicon/simpleicons CDN URL for a given tech name, or null if unknown.

const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';
const SIMPLEICONS_BASE = 'https://cdn.simpleicons.org';

function devicon(name: string, variant = 'original') {
  return `${DEVICON_BASE}/${name}/${name}-${variant}.svg`;
}

function simpleicon(slug: string, color = '888888') {
  return `${SIMPLEICONS_BASE}/${slug}/${color}`;
}

const ICON_MAP: Record<string, string> = {
  typescript:           devicon('typescript'),
  javascript:           devicon('javascript'),
  python:               devicon('python'),
  c:                    devicon('c'),
  java:                 devicon('java'),
  html:                 devicon('html5'),
  css:                  devicon('css3'),
  php:                  devicon('php'),
  react:                devicon('react'),
  'react native':       devicon('react'),
  reactnative:          devicon('react'),
  'next.js':            devicon('nextjs'),
  nextjs:               devicon('nextjs'),
  astro:                simpleicon('astro'),
  tailwindcss:          devicon('tailwindcss'),
  tailwind:             devicon('tailwindcss'),
  vite:                 devicon('vitejs'),
  vitejs:               devicon('vitejs'),
  expo:                 simpleicon('expo'),
  android:              devicon('android'),
  'node.js':            devicon('nodejs'),
  nodejs:               devicon('nodejs'),
  express:              devicon('express'),
  fastapi:              devicon('fastapi'),
  flask:                devicon('flask'),
  deno:                 devicon('denojs'),
  postgresql:           devicon('postgresql'),
  postgres:             devicon('postgresql'),
  mongodb:              devicon('mongodb'),
  sqlite:               devicon('sqlite'),
  mysql:                devicon('mysql'),
  supabase:             devicon('supabase'),
  redis:                devicon('redis'),
  firebase:             devicon('firebase'),
  websockets:           simpleicon('websocket'),
  cloudflareworkers:    simpleicon('cloudflare'),
  openai:               simpleicon('openai'),
  'openai api':         simpleicon('openai'),
  'ai/ml':              simpleicon('openai'),
  figma:                devicon('figma'),
  blender:              devicon('blender'),
  git:                  devicon('git'),
  github:               simpleicon('github'),
  docker:               devicon('docker'),
  linux:                devicon('linux'),
  ubuntu:               devicon('ubuntu'),
  aws:                  devicon('amazonwebservices', 'original-wordmark'),
  amazonwebservices:    devicon('amazonwebservices', 'original-wordmark'),
  vercel:               simpleicon('vercel'),
  postman:              devicon('postman'),
  'vs code':            devicon('vscode'),
  vscode:               devicon('vscode'),
  jetbrains:            devicon('jetbrains'),
  linear:               simpleicon('linear'),
  google:               devicon('google'),
  'google api':         devicon('google'),
  go:                   devicon('go'),
  nestjs:               devicon('nestjs'),
  prisma:               simpleicon('prisma'),
  'objective-c':        devicon('c'),
  'spotify api':        simpleicon('spotify'),
  mcp:                  simpleicon('anthropic'),
};

export function getTechIconUrl(tech: string): string | null {
  const key = tech.toLowerCase().trim();
  return ICON_MAP[key] ?? null;
}
