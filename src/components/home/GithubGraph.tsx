'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionWeek {
  days: ContributionDay[];
}

// Fetch contributions from GitHub
async function fetchContributions(username: string): Promise<ContributionWeek[]> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();

    // Group into weeks
    const days: ContributionDay[] = (data.contributions || []).map((d: any) => ({
      date: d.date,
      count: d.count,
      level: Math.min(4, Math.floor(d.count / 3)) as 0 | 1 | 2 | 3 | 4,
    }));

    const weeks: ContributionWeek[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push({ days: days.slice(i, i + 7) });
    }
    return weeks;
  } catch {
    return [];
  }
}

const LEVEL_COLORS = [
  'transparent',                 // 0 — empty
  'rgba(0, 187, 255, 0.25)',     // 1 — low
  'rgba(0, 187, 255, 0.45)',     // 2 — medium
  'rgba(0, 187, 255, 0.70)',     // 3 — high
  'rgba(0, 187, 255, 0.95)',     // 4 — max
];

function ContributionCell({ day, animated, delay }: { day: ContributionDay; animated: boolean; delay: number }) {
  return (
    <motion.div
      title={`${day.count} contributions on ${day.date}`}
      initial={animated ? { opacity: 0, scale: 0.3 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={{ delay, duration: 0.2, ease: 'easeOut' }}
      style={{
        width: '10px',
        height: '10px',
        borderRadius: '2px',
        backgroundColor: day.count === 0 ? 'var(--muted)' : LEVEL_COLORS[day.level],
        cursor: day.count > 0 ? 'default' : undefined,
      }}
    />
  );
}

export default function GithubGraph() {
  const [weeks, setWeeks] = useState<ContributionWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);

  useEffect(() => {
    fetchContributions('aryanranderiya').then(w => {
      setWeeks(w);
      const total = w.flatMap(week => week.days).reduce((sum, d) => sum + d.count, 0);
      setTotalContributions(total);
      setLoading(false);
    });
  }, []);

  return (
    <section style={{ paddingBottom: 48 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="section-header" style={{ marginBottom: 0 }}>GitHub Contributions</div>
        {!loading && (
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>
              {totalContributions.toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>contributions this year</div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto" style={{ padding: '4px 0' }}>
        {loading ? (
          <div className="flex gap-1">
            {Array.from({ length: 52 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-[10px] h-[10px] rounded-sm animate-pulse"
                    style={{ background: 'var(--muted)', borderRadius: '2px' }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-[3px]">
            {weeks.slice(-52).map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.days.map((day, di) => (
                  <ContributionCell
                    key={day.date}
                    day={day}
                    animated={true}
                    delay={(wi * 7 + di) * 0.003}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className="w-[10px] h-[10px] rounded-sm"
            style={{
              background: level === 0 ? 'var(--muted)' : LEVEL_COLORS[level],
            }}
          />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>More</span>
      </div>
    </section>
  );
}
