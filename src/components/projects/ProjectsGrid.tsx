'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import ProjectDrawer from './ProjectDrawer';

interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  tech: string[];
  type: string;
  status: string;
  featured: boolean;
  images: string[];
  folder: string;
  url?: string;
  github?: string;
  coverImage?: string;
}

// Filter options: folder-based + type-based
const FOLDER_FILTERS = ['Featured', 'Client', 'Hackathon'] as const;
const TYPE_FILTERS = ['web', 'mobile', 'other'] as const;

const TYPE_LABELS: Record<string, string> = {
  web: 'Web',
  mobile: 'Mobile',
  other: 'Other',
  os: 'OS',
  design: 'Design',
};

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Determine which folder filters have projects
  const availableFolderFilters = useMemo(() => {
    return FOLDER_FILTERS.filter(f =>
      projects.some(p => p.folder === f)
    );
  }, [projects]);

  // Determine which type filters have projects
  const availableTypeFilters = useMemo(() => {
    const inData = new Set(projects.map(p => p.type));
    return TYPE_FILTERS.filter(t => inData.has(t));
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects;

    // Apply folder or type filter
    if (activeFilter === 'all') {
      // no op
    } else if (FOLDER_FILTERS.includes(activeFilter as any)) {
      list = list.filter(p => p.folder === activeFilter);
    } else {
      list = list.filter(p => p.type === activeFilter);
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tech.some(t => t.toLowerCase().includes(q)) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [projects, activeFilter, search]);

  const allFilters: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    ...availableFolderFilters.map((f: string) => ({ key: f, label: f })),
    ...availableTypeFilters.map((t: string) => ({ key: t, label: TYPE_LABELS[t] ?? t })),
  ];

  return (
    <div>
      {/* Filter pills + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {allFilters.map(({ key, label }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 500 : 400,
                padding: '4px 10px',
                borderRadius: '9999px',
                border: 'none',
                background: isActive ? 'var(--muted-bg)' : 'transparent',
                color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                letterSpacing: '0.01em',
              }}
            >
              {label}
            </button>
          );
        })}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={{
            background: 'var(--muted-bg)',
            border: 'none',
            borderRadius: '9999px',
            padding: '5px 14px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
            letterSpacing: '-0.01em',
            width: '140px',
            flexShrink: 0,
          }}
        />
      </div>

      {/* Project grid */}
      <AnimatePresence mode="sync" initial={false}>
        {filtered.length > 0 ? (
          <motion.div
            key={activeFilter + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {filtered.map((project: Project, i: number) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={i}
                onClick={setSelectedProject}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '64px 0', textAlign: 'center', fontSize: '13px', color: 'var(--text-ghost)' }}
          >
            No projects found.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project drawer */}
      <ProjectDrawer
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
