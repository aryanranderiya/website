'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function AnalogClock({ date }: { date: Date }) {
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
      {/* Clock face */}
      <circle cx="24" cy="24" r="22" fill="none" stroke="var(--border)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="21" fill="var(--card)" />

      {/* Hour markers */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 24 + 17 * Math.sin(angle);
        const y1 = 24 - 17 * Math.cos(angle);
        const x2 = 24 + (i % 3 === 0 ? 14 : 15.5) * Math.sin(angle);
        const y2 = 24 - (i % 3 === 0 ? 14 : 15.5) * Math.cos(angle);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--muted-foreground)"
            strokeWidth={i % 3 === 0 ? 1.5 : 0.75}
            strokeLinecap="round"
            opacity={0.5}
          />
        );
      })}

      {/* Hour hand */}
      <line
        x1="24" y1="24"
        x2={24 + 10 * Math.sin((hourDeg * Math.PI) / 180)}
        y2={24 - 10 * Math.cos((hourDeg * Math.PI) / 180)}
        stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1="24" y1="24"
        x2={24 + 14 * Math.sin((minuteDeg * Math.PI) / 180)}
        y2={24 - 14 * Math.cos((minuteDeg * Math.PI) / 180)}
        stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Second hand */}
      <line
        x1="24" y1="28"
        x2={24 + 16 * Math.sin((secondDeg * Math.PI) / 180)}
        y2={24 - 16 * Math.cos((secondDeg * Math.PI) / 180)}
        stroke="var(--foreground)" strokeWidth="1" strokeLinecap="round" opacity={0.6}
      />

      {/* Center dot */}
      <circle cx="24" cy="24" r="2" fill="var(--foreground)" />
      <circle cx="24" cy="24" r="1" fill="var(--background)" />
    </svg>
  );
}

export default function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  return (
    <div
      className="rounded-2xl border p-5 flex items-center gap-4"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <AnalogClock date={now} />
      <div>
        <motion.div
          key={formatTime(now).slice(0, 5)} // Re-animate on minute change
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-semibold tabular-nums"
          style={{ letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}
        >
          {formatTime(now)}
        </motion.div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          {formatDate(now)} · IST
        </div>
      </div>
    </div>
  );
}
