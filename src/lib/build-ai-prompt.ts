/**
 * Dynamically builds the AI system prompt from live portfolio data.
 * Called at build time in Layout.astro — any data update auto-rebuilds the prompt.
 */

import type { CollectionEntry } from 'astro:content';
import type { Experience } from '@/data/experience';
import type { FreelanceProject } from '@/data/freelance';
import type { SITE } from '@/constants/site';

interface BuildAIPromptOptions {
  projects: CollectionEntry<'projects'>[];
  blogPosts: CollectionEntry<'blog'>[];
  experience: Experience[];
  education: { institution: string; shortName: string; degree: string; field: string; startYear: string; endYear: string; location: string }[];
  certifications: { name: string; issuer: string; date: string; url: string }[];
  pastWork: FreelanceProject[];
  site: typeof SITE;
}

export function buildAIPrompt({
  projects,
  blogPosts,
  experience,
  education,
  certifications,
  pastWork,
  site,
}: BuildAIPromptOptions): string {
  const sorted = [...projects].sort((a, b) => a.data.order - b.data.order);

  // ── Personal bio ───────────────────────────────────────────────────────────
  const bio = `You are a helpful AI assistant embedded in Aryan Randeriya's portfolio (${site.url}). Answer questions about Aryan accurately and concisely — warm, direct, professional. 2–4 sentences unless more detail is needed. Only use information below. If asked something unrelated to Aryan, politely redirect.

## Personal Bio
Name: Aryan Randeriya
Location: ${site.location} (born in the United Kingdom)
Portfolio: ${site.url}
Email: ${site.email}
GitHub: github.com/${site.github}
Twitter/X: @${site.twitter}
LinkedIn: linkedin.com/in/${site.linkedin}
Instagram: @${site.instagram}

About (in his own words): "I'm a tech nerd who's been tinkering with computers since a very young age. Born in the United Kingdom, based in India. I love building products — I'm a product guy but a developer and designer by heart. I love music — I have a Spotify playlist with 2000+ songs. I absolutely love movies and am extremely passionate about them. I also love food — I love trying different cuisines. I love tinkering around with code, shipping things, and exploring new things — maybe that's the ADHD too."

Current mission: "Building GAIA — a proactive personal AI assistant that acts before you even need to ask. The goal: every person in the world should have their own truly intelligent assistant."

Aryan is Founder & CEO of The Experience Company. The name comes from their belief that their mission is to improve the human experience, and their care about the experience of every product they build.

Things he wants to explore: Rust, hardware, robotics, energy infrastructure, personal companions and smart wearables (through GAIA), low-level programming — C, OS internals.

Site description: "${site.description}"`;

  // ── Education ──────────────────────────────────────────────────────────────
  const educationSection = `## Education
${education.map(e => `- ${e.degree} ${e.field}, ${e.institution} (${e.shortName}), ${e.location} (${e.startYear}–${e.endYear})`).join('\n')}
${certifications.map(c => `- Certificate: ${c.name}, ${c.issuer} (${c.date})`).join('\n')}`;

  // ── Experience ─────────────────────────────────────────────────────────────
  const experienceSection = `## Experience
${experience.map((e, i) => {
    const highlights = e.highlights.length > 0
      ? '\n' + e.highlights.map(h => `   - ${h}`).join('\n')
      : '';
    return `${i + 1}. ${e.company} — ${e.role} (${e.startDate}–${e.endDate}, ${e.employmentType}, ${e.location})
   ${e.description}${highlights}
   Tech: ${e.skills.join(', ')}${e.website ? `\n   URL: ${e.website}` : ''}`;
  }).join('\n\n')}`;

  // ── Projects ───────────────────────────────────────────────────────────────
  const projectSection = `## Projects (${sorted.length} total)
${sorted.map(p => {
    const d = p.data;
    const body = p.body?.trim();
    const lines = [
      `### ${d.title}`,
      d.description,
      `Tech: ${d.tech.join(', ')} | Type: ${d.type} | Status: ${d.status} | Folder: ${d.folder}`,
      d.tags.length ? `Tags: ${d.tags.join(', ')}` : '',
      d.url ? `URL: ${d.url}` : '',
      d.github ? `GitHub: ${d.github}` : '',
      d.featured ? 'Featured: yes' : '',
      body ? `\n${body}` : '',
    ].filter(Boolean);
    return lines.join('\n');
  }).join('\n\n---\n\n')}`;

  // ── Freelance work ─────────────────────────────────────────────────────────
  const freelanceSection = `## Freelance Client Work (${pastWork.length} projects)
${pastWork.map(w => {
    const lines = [
      `### ${w.name} — ${w.type}`,
      w.description,
      `Tech: ${w.tech.join(', ')}`,
      w.url ? `URL: ${w.url}` : '',
      w.testimonial
        ? `Testimonial: "${w.testimonial.quote}" — ${w.testimonial.author}, ${w.testimonial.role}`
        : '',
    ].filter(Boolean);
    return lines.join('\n');
  }).join('\n\n')}`;

  // ── Blog ───────────────────────────────────────────────────────────────────
  const publishedPosts = blogPosts.filter(p => !p.data.draft);
  const blogSection = publishedPosts.length > 0
    ? `## Blog (${publishedPosts.length} posts at ${site.url}/blog)
${publishedPosts.map(p => `- "${p.data.title}" (${p.data.category}) — ${p.data.description}${p.data.tags.length ? ` [${p.data.tags.join(', ')}]` : ''}`).join('\n')}`
    : '';

  // ── Pages ──────────────────────────────────────────────────────────────────
  const pagesSection = `## Portfolio Pages
- /projects — All ${sorted.length} personal and freelance projects
- /freelance — ${pastWork.length} client work projects
- /design — Graphic design, branding, apparel work
- /tools — Curated tools Aryan uses daily
- /bookshelf — Books Aryan has read
- /movies — Favorite films
- /gallery — Photos
- /blog — Writing (${publishedPosts.length} posts)
- /resume — Full resume`;

  return [bio, educationSection, experienceSection, projectSection, freelanceSection, blogSection, pagesSection]
    .filter(Boolean)
    .join('\n\n');
}
