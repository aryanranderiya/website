'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionWeek {
  days: ContributionDay[];
}

export async function fetchContributions(username: string): Promise<{ weeks: ContributionWeek[]; total: number }> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
  if (!res.ok) throw new Error('Failed to fetch contributions');
  const data = await res.json();

  const days: ContributionDay[] = (data.contributions || []).map((d: any) => ({
    date: d.date,
    count: d.count,
    level: d.level as 0 | 1 | 2 | 3 | 4,
  }));

  const weeks: ContributionWeek[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push({ days: days.slice(i, i + 7) });
  }

  const total = days.reduce((sum, d) => sum + d.count, 0);
  return { weeks, total };
}

// Same green (#40c463), varying opacity
const LEVEL_COLORS = [
  'rgba(64, 196, 99, 0.08)',  // 0 — no contributions
  'rgba(64, 196, 99, 0.30)',  // 1 — low
  'rgba(64, 196, 99, 0.55)',  // 2 — medium
  'rgba(64, 196, 99, 0.80)',  // 3 — high
  'rgba(64, 196, 99, 1.00)',  // 4 — max
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Returns month label positions: { label, weekIndex } for the first week of each month
function getMonthLabels(weeks: ContributionWeek[]): { label: string; index: number }[] {
  const labels: { label: string; index: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week.days.find(d => d.date);
    if (!firstDay) return;
    const month = new Date(firstDay.date + 'T00:00:00').getMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], index: wi });
      lastMonth = month;
    }
  });
  return labels;
}

function ContributionCell({
  day,
  animated,
  delay,
}: {
  day: ContributionDay;
  animated: boolean;
  delay: number;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  return (
    <div style={{ flex: 1, aspectRatio: '1', position: 'relative' }}>
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.3 } : undefined}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={{ delay, duration: 0.2, ease: 'easeOut' }}
        onMouseEnter={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setTooltip({ x: rect.left + rect.width / 2, y: rect.top });
        }}
        onMouseLeave={() => setTooltip(null)}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '2px',
          backgroundColor: LEVEL_COLORS[day.level],
          cursor: 'default',
        }}
      />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#111',
              color: '#fdfdfc',
              fontSize: '11px',
              lineHeight: 1.5,
              padding: '6px 10px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {day.count === 0 ? 'No contributions' : `${day.count} contribution${day.count !== 1 ? 's' : ''}`}
            </div>
            <div style={{ opacity: 0.5, fontSize: '10px', marginTop: '1px' }}>{formatDate(day.date)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GithubGraph({ compact = false }: { compact?: boolean }) {
  const { data, isLoading } = useSWR(
    'github-contributions-aryanranderiya',
    () => fetchContributions('aryanranderiya'),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 3_600_000, // 1 hour
    }
  );

  const weeks = data?.weeks.slice(-52) ?? [];
  const totalContributions = data?.total ?? 0;
  const monthLabels = getMonthLabels(weeks);

  const graph = (
    <div style={{ width: '100%' }}>
      {isLoading ? (
        // Skeleton — full width grid
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gap: '3px', width: '100%' }}>
          {Array.from({ length: 52 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {Array.from({ length: 7 }).map((_, j) => (
                <div
                  key={j}
                  className="animate-pulse"
                  style={{ aspectRatio: '1', borderRadius: '2px', background: 'rgba(64, 196, 99, 0.10)', width: '100%' }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%' }}>
          {/* Month labels */}
          {!compact && (
            <div style={{ position: 'relative', height: '16px', marginBottom: '4px', width: '100%' }}>
              {monthLabels.map(({ label, index }) => (
                <span
                  key={label + index}
                  style={{
                    position: 'absolute',
                    left: `${(index / 52) * 100}%`,
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.02em',
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gap: '3px', width: '100%' }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.days.map((day, di) => (
                  <ContributionCell
                    key={day.date}
                    day={day}
                    animated={!compact}
                    delay={(wi * 7 + di) * 0.003}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (compact) return graph;

  return (
    <section style={{ paddingBottom: 48 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="section-header" style={{ marginBottom: 0 }}>GitHub Contributions</div>
        {!isLoading && (
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>
              {totalContributions.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>contributions this year</div>
          </div>
        )}
      </div>

      {graph}

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              background: LEVEL_COLORS[level],
            }}
          />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>More</span>
      </div>
    </section>
  );
}
