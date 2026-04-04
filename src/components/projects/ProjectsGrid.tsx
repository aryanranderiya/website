'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  HugeiconsIcon,
  Search01Icon,
  FilterIcon,
  Delete01Icon,
  WebDesignIcon,
  MobileProgramming02Icon,
  ComputerTerminalIcon,
  ComputerProgrammingIcon,
  GameController03Icon,
} from '@icons';
import ProjectCard from './ProjectCard';
import { getTechIconUrl } from '../../utils/techIcons';
import { useAfterPreloader } from '@/hooks/useAfterPreloader';

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

// Alternating tilt: even rows lean left, odd rows lean right
const ROTATIONS = [-7, 6] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TYPE_CHIPS: { value: string; label: string; icon?: any }[] = [
  { value: 'web',     label: 'Web',     icon: WebDesignIcon },
  { value: 'mobile',  label: 'Mobile',  icon: MobileProgramming02Icon },
  { value: 'cli',     label: 'CLI',     icon: ComputerTerminalIcon },
  { value: 'desktop', label: 'Desktop', icon: ComputerProgrammingIcon },
  { value: 'game',    label: 'Game',    icon: GameController03Icon },
  { value: 'os',      label: 'OS',      icon: ComputerProgrammingIcon },
  { value: 'other',   label: 'Other' },
];

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [hovered, setHovered] = useState<HoveredState | null>(null);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const ready = useAfterPreloader();
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
    if (!tagPopoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target as Node)
      ) {
        setTagPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tagPopoverOpen]);

  // Count projects per tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      p.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    });
    return counts;
  }, [projects]);

  const sortedTags = useMemo(() =>
    Object.entries(tagCounts).sort((a, b) => b[1] - a[1]),
  [tagCounts]);

  const filtered = useMemo(() => {
    let list = projects;

    if (activeTypeFilter) {
      list = list.filter(p => p.type === activeTypeFilter);
    }

    if (activeTagFilters.length > 0) {
      list = list.filter(p =>
        activeTagFilters.every(t => p.tags.includes(t))
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [projects, activeTypeFilter, activeTagFilters, search]);

  // Only show type chips for types that have at least one project
  const availableTypes = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    projects.forEach(p => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });
    return TYPE_CHIPS.filter(c => typeCounts[c.value] > 0);
  }, [projects]);

  const handleHoverChange = (data: { project: Project; index: number; el: HTMLElement } | null) => {
    if (!data) { setHovered(null); return; }
    setHovered({ project: data.project, index: data.index, rect: data.el.getBoundingClientRect() });
  };

  const rotation = hovered ? ROTATIONS[hovered.index % 2] : 0;
  const previewTop = hovered ? hovered.rect.top + hovered.rect.height / 2 : 0;

  const toggleTagFilter = (tag: string) => {
    setActiveTagFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as const, delay: 0.12 }}
    >
      {/* Type filter chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTypeFilter(null)}
          style={{
            padding: '3px 10px',
            borderRadius: '9999px',
            border: 'none',
            background: activeTypeFilter === null ? 'var(--text-primary)' : 'var(--muted-bg)',
            color: activeTypeFilter === null ? 'var(--background)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: activeTypeFilter === null ? 500 : 400,
            letterSpacing: '-0.01em',
            transition: 'all 150ms ease',
          }}
        >
          All
        </button>
        {availableTypes.map(chip => (
          <button
            key={chip.value}
            onClick={() => setActiveTypeFilter(activeTypeFilter === chip.value ? null : chip.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 10px',
              borderRadius: '9999px',
              border: 'none',
              background: activeTypeFilter === chip.value ? 'var(--text-primary)' : 'var(--muted-bg)',
              color: activeTypeFilter === chip.value ? 'var(--background)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: activeTypeFilter === chip.value ? 500 : 400,
              letterSpacing: '-0.01em',
              transition: 'all 150ms ease',
            }}
          >
            {chip.icon && <HugeiconsIcon icon={chip.icon} size={11} color="currentColor" />}
            {chip.label}
          </button>
        ))}
      </div>

      {/* Filter button + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', width: '100%' }}>

        {/* Tag filter button */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            ref={filterBtnRef}
            onClick={() => setTagPopoverOpen(o => !o)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: '9999px',
              border: 'none',
              background: 'var(--muted-bg)',
              color: activeTagFilters.length > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              opacity: tagPopoverOpen ? 0.7 : 1,
              fontSize: '11px',
              letterSpacing: '0.01em',
              lineHeight: '1.45',
            }}
          >
            <HugeiconsIcon icon={FilterIcon} size={11} color="currentColor" />
            <span>
              {activeTagFilters.length > 0 ? `${activeTagFilters.length} filter${activeTagFilters.length > 1 ? 's' : ''}` : 'Filter'}
            </span>
          </button>

          {tagPopoverOpen && (
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
                  Filter by tag
                </span>
                {activeTagFilters.length > 0 && (
                  <button
                    onClick={() => setActiveTagFilters([])}
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
              {sortedTags.map(([tag, count]) => {
                const isOn = activeTagFilters.includes(tag);
                const iconUrl = getTechIconUrl(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTagFilter(tag)}
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

        <div style={{ flex: 1 }} />

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
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search..."
            style={{
              background: 'var(--muted-bg)', border: 'none', borderRadius: '9999px',
              padding: `5px ${!searchFocused && !search ? '36px' : '14px'} 5px 28px`,
              fontSize: '12px', color: 'var(--text-primary)',
              outline: 'none', letterSpacing: '-0.01em', width: '140px',
            }}
          />
          {!searchFocused && !search && (
            <kbd style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: '10px', color: 'var(--text-ghost)', pointerEvents: 'none',
              fontFamily: 'inherit', letterSpacing: '0',
            }}>
              ⌘F
            </kbd>
          )}
        </div>
      </div>

      {/* Project list */}
      <AnimatePresence mode="sync" initial={false}>
        {filtered.length > 0 ? (
          <motion.div
            key={search + activeTagFilters.join(',') + (activeTypeFilter ?? '')}
            initial="hidden"
            animate={ready ? 'show' : 'hidden'}
            exit={{ opacity: 0 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
            }}
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

    </motion.div>

    {/* Preview image portal — rendered at body to avoid filter/transform containing block */}
    {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {hovered?.project.coverImage && (
          <motion.div
            key={hovered.project.slug}
            initial={{ opacity: 0, scale: 0.84, rotate: rotation > 0 ? rotation + 12 : rotation - 12 }}
            animate={{ opacity: 1, scale: 1, rotate: rotation }}
            exit={{ opacity: 0, scale: 0.84 }}
            transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
            style={{
              position: 'fixed',
              left: hovered.rect.right + 24,
              top: previewTop,
              y: '-50%',
              width: 200,
              borderRadius: 12,
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 9999,
              background: 'var(--background)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <img
              src={hovered.project.coverImage}
              alt={hovered.project.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{
              padding: '8px 10px 10px',
              background: 'var(--background)',
            }}>
              <p style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                letterSpacing: '-0.01em',
                margin: 0,
              }}>
                {hovered.project.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
