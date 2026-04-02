'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon, Search01Icon, FilterIcon, Delete01Icon } from '@icons';
import ProjectCard from './ProjectCard';
import { getTechIconUrl } from '../../utils/techIcons';

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

interface HoveredState {
  project: Project;
  index: number;
  rect: DOMRect;
}

// "Projects" folder is the plain default — not shown as a filter
const FOLDER_FILTERS = [
  { value: 'Featured',  label: 'Featured'  },
  { value: 'Client',    label: 'Freelance' },
  { value: 'Hackathon', label: 'Hackathon' },
] as const;

const TYPE_FILTERS = [
  { value: 'web',    label: 'Web'    },
  { value: 'mobile', label: 'Mobile' },
] as const;

// Alternating tilt: even rows lean left, odd rows lean right
const ROTATIONS = [-7, 6] as const;

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<HoveredState | null>(null);
  const [activeTechFilters, setActiveTechFilters] = useState<string[]>([]);
  const [techPopoverOpen, setTechPopoverOpen] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!techPopoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target as Node)
      ) {
        setTechPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [techPopoverOpen]);

  const availableFolderFilters = useMemo(() => {
    return FOLDER_FILTERS.filter(f => projects.some(p => p.folder === f.value));
  }, [projects]);

  const availableTypeFilters = useMemo(() => {
    const inData = new Set(projects.map(p => p.type));
    return TYPE_FILTERS.filter(t => inData.has(t.value));
  }, [projects]);

  // Count projects per tech tag (union of tags + tech)
  const techTagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const all = Array.from(new Set([...p.tags, ...p.tech]));
      all.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    });
    return counts;
  }, [projects]);

  const sortedTechTags = useMemo(() =>
    Object.entries(techTagCounts).sort((a, b) => b[1] - a[1]),
  [techTagCounts]);

  const filtered = useMemo(() => {
    let list = projects;

    if (activeFilter !== 'all') {
      const isFolderFilter = FOLDER_FILTERS.some(f => f.value === activeFilter);
      list = isFolderFilter
        ? list.filter(p => p.folder === activeFilter)
        : list.filter(p => p.type === activeFilter);
    }

    if (activeTechFilters.length > 0) {
      list = list.filter(p => {
        const all = new Set([...p.tags, ...p.tech]);
        return activeTechFilters.every(t => all.has(t));
      });
    }

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
  }, [projects, activeFilter, activeTechFilters, search]);

  const allFilters = [
    { key: 'all', label: 'All' },
    ...availableFolderFilters.map(f => ({ key: f.value, label: f.label })),
    ...availableTypeFilters.map(t => ({ key: t.value, label: t.label })),
  ];

  const handleHoverChange = (data: { project: Project; index: number; el: HTMLElement } | null) => {
    if (!data) { setHovered(null); return; }
    setHovered({ project: data.project, index: data.index, rect: data.el.getBoundingClientRect() });
  };

  const rotation = hovered ? ROTATIONS[hovered.index % 2] : 0;
  // Center the preview vertically on the hovered row
  const previewTop = hovered ? hovered.rect.top + hovered.rect.height / 2 : 0;

  const toggleTechFilter = (tag: string) => {
    setActiveTechFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div>
      {/* Filter pills + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', width: '100%' }}>

        {/* Tech filter icon button — outside overflow:hidden so popover isn't clipped */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              ref={filterBtnRef}
              onClick={() => setTechPopoverOpen(o => !o)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: '9999px',
                border: 'none',
                background: 'var(--muted-bg)',
                color: activeTechFilters.length > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                opacity: techPopoverOpen ? 0.7 : 1,
                fontSize: '11px',
                letterSpacing: '0.01em',
                lineHeight: '1.45',
              }}
            >
              <HugeiconsIcon icon={FilterIcon} size={11} color="currentColor" />
              <span>
                {activeTechFilters.length > 0 ? `${activeTechFilters.length} filter${activeTechFilters.length > 1 ? 's' : ''}` : 'Filter'}
              </span>
            </button>

            {techPopoverOpen && (
              <div
                ref={popoverRef}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  background: 'var(--background)',
                  borderRadius: 20,
                  padding: '6px',
                  minWidth: 210,
                  maxHeight: 300,
                  overflowY: 'auto',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 8px 6px',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-ghost)', letterSpacing: '-0.01em' }}>
                    Filters
                  </span>
                  {activeTechFilters.length > 0 && (
                    <button
                      onClick={() => setActiveTechFilters([])}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 6px', fontSize: '10px',
                        color: '#ef4444', background: 'transparent',
                        border: 'none', borderRadius: 6, cursor: 'pointer',
                        letterSpacing: '0.01em',
                      }}
                    >
                      Clear
                      <HugeiconsIcon icon={Delete01Icon} size={11} color="currentColor" />
                    </button>
                  )}
                </div>
                {sortedTechTags.map(([tag, count]) => {
                  const isOn = activeTechFilters.includes(tag);
                  const iconUrl = getTechIconUrl(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTechFilter(tag)}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted-bg)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isOn ? 'var(--muted-bg)' : 'transparent'; }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '5px 8px',
                        borderRadius: 8,
                        border: 'none',
                        background: isOn ? 'var(--muted-bg)' : 'transparent',
                        color: isOn ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: isOn ? 500 : 400,
                        letterSpacing: '-0.01em',
                        transition: 'background 100ms ease',
                        gap: 7,
                      }}
                    >
                      {/* Checkbox */}
                      <span style={{
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isOn ? 'var(--text-primary)' : 'var(--muted-bg)',
                        transition: 'all 100ms ease',
                      }}>
                        {isOn && (
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="var(--popover)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {iconUrl ? (
                        <img src={iconUrl} alt={tag} width={13} height={13} style={{ objectFit: 'contain', flexShrink: 0, opacity: isOn ? 1 : 0.7 }} />
                      ) : (
                        <span style={{ width: 13, flexShrink: 0 }} />
                      )}
                      <span style={{ flex: 1, textAlign: 'left' }}>{tag}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
        </div>

        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
          {allFilters.map(({ key, label }) => {
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(isActive && key !== 'all' ? 'all' : key)}
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
                  lineHeight: '1.45',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', color: 'var(--text-ghost)', pointerEvents: 'none',
          }}>
            <HugeiconsIcon icon={Search01Icon} size={12} />
          </span>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              background: 'var(--muted-bg)', border: 'none', borderRadius: '9999px',
              padding: '5px 14px 5px 28px', fontSize: '12px', color: 'var(--text-primary)',
              outline: 'none', letterSpacing: '-0.01em', width: '140px',
            }}
          />
        </div>
      </div>

      {/* Project list */}
      <AnimatePresence mode="sync" initial={false}>
        {filtered.length > 0 ? (
          <motion.div
            key={activeFilter + search + activeTechFilters.join(',')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {filtered.map((project: Project, i: number) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={i}
                onHoverChange={handleHoverChange}
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

      {/* Preview image — aligns vertically with the hovered row, floats to the right */}
      <AnimatePresence>
        {hovered?.project.coverImage && (
          <motion.div
            key={hovered.project.slug}
            initial={{ opacity: 0, scale: 0.84, rotate: rotation > 0 ? rotation + 12 : rotation - 12 }}
            animate={{ opacity: 1, scale: 1, rotate: rotation, top: previewTop }}
            exit={{ opacity: 0, scale: 0.84, rotate: rotation > 0 ? rotation + 12 : rotation - 12 }}
            transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
            style={{
              position: 'fixed',
              right: '18vw',
              top: previewTop,
              translateY: '-50%',
              width: 240,
              borderRadius: 12,
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            <img
              src={hovered.project.coverImage}
              alt={hovered.project.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
