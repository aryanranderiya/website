'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotifyTrack {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
  progress?: number;
  duration?: number;
}

async function getNowPlaying(): Promise<SpotifyTrack> {
  try {
    const res = await fetch('/api/spotify.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Not playing');
    return await res.json();
  } catch {
    return { isPlaying: false };
  }
}

const SHIMMER_KF = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

function ShimmerBlock({
  w,
  h,
  r = 6,
}: {
  w: string | number;
  h: number;
  r?: number;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background:
          'linear-gradient(90deg, var(--border) 25%, var(--border-strong) 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        flexShrink: 0,
      }}
    />
  );
}

function MusicBars() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 10 }}>
      {[1, 2, 3].map(i => (
        <motion.span
          key={i}
          style={{
            width: 2,
            borderRadius: 999,
            background: '#1DB954',
            display: 'block',
          }}
          animate={{ height: ['40%', '100%', '60%', '80%', '40%'] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

const SPOTIFY_LOGO = 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Full_Logo_RGB_Green.png';

function formatTime(ms?: number): string {
  if (!ms) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const HEIGHT = 160;
const ART_SIZE = 64;

export default function SpotifyWidget() {
  const [track, setTrack] = useState<SpotifyTrack>({ isPlaying: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNowPlaying().then(t => {
      setTrack(t);
      setLoading(false);
    });
    const interval = setInterval(() => getNowPlaying().then(setTrack), 30000);
    return () => clearInterval(interval);
  }, []);

  const progressPct =
    track.progress && track.duration
      ? (track.progress / track.duration) * 100
      : 0;

  return (
    <div
      style={{
        height: HEIGHT,
        borderRadius: 20,
        background: 'var(--muted-bg)',
        padding: '15px 17px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{SHIMMER_KF}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <img src={SPOTIFY_LOGO} alt="Spotify" style={{ height: 14, width: 'auto' }} />

        <AnimatePresence>
          {track.isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <MusicBars />
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--text-ghost)',
                  fontWeight: 500,
                }}
              >
                Now Playing
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: 13, alignItems: 'center', width: '100%' }}
            >
              <ShimmerBlock w={ART_SIZE} h={ART_SIZE} r={10} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <ShimmerBlock w="75%" h={12} r={5} />
                <ShimmerBlock w="55%" h={10} r={5} />
                <ShimmerBlock w="40%" h={9} r={5} />
              </div>
            </motion.div>
          ) : track.isPlaying && track.title ? (
            <motion.div
              key={track.title}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
              style={{ display: 'flex', gap: 13, alignItems: 'center', width: '100%' }}
            >
              {/* Album art */}
              {track.albumArt ? (
                <img
                  src={track.albumArt}
                  alt={track.album ?? 'Album art'}
                  style={{
                    width: ART_SIZE,
                    height: ART_SIZE,
                    borderRadius: 10,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: ART_SIZE,
                    height: ART_SIZE,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: 'var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-ghost)',
                  }}
                >
                  <img src={SPOTIFY_LOGO} alt="Spotify" style={{ width: 40, opacity: 0.4 }} />
                </div>
              )}

              {/* Track info */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <a
                  href={track.songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    lineHeight: 1.3,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#1DB954';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      'var(--text-primary)';
                  }}
                >
                  {track.title}
                </a>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {track.artist}
                </span>
                {track.album && (
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-ghost)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 2,
                    }}
                  >
                    {track.album}
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="not-playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '-0.01em',
                }}
              >
                Not playing
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-ghost)' }}>
                Nothing in queue
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'relative' }}>
        <AnimatePresence>
          {track.isPlaying && track.duration ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: 'var(--text-ghost)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {formatTime(track.progress)}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: 'var(--text-ghost)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {formatTime(track.duration)}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: 'var(--border)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: '#1DB954',
                    borderRadius: 999,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ) : (
            <div style={{ height: 17 }} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
