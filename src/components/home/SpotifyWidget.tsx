// TODO: Spotify API credentials needed in .env file:
//   SPOTIFY_CLIENT_ID=your_client_id
//   SPOTIFY_CLIENT_SECRET=your_client_secret
//   SPOTIFY_REFRESH_TOKEN=your_refresh_token
// Until then this will show "Not playing"
// See: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

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

function MusicBars() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
      {[1, 2, 3].map(i => (
        <motion.span
          key={i}
          style={{
            width: 2,
            borderRadius: 999,
            background: 'var(--accent-blue)',
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

export default function SpotifyWidget() {
  const [track, setTrack] = useState<SpotifyTrack>({ isPlaying: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNowPlaying().then(t => {
      setTrack(t);
      setLoading(false);
    });

    const interval = setInterval(() => {
      getNowPlaying().then(setTrack);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Spotify icon */}
      <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--text-muted)" style={{ flexShrink: 0 }}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 12, color: 'var(--text-ghost)' }}
          >
            …
          </motion.span>
        ) : track.isPlaying && track.title ? (
          <motion.div
            key={track.title}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MusicBars />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
              Now Playing —
            </span>
            <a
              href={track.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                fontWeight: 500,
                textDecoration: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 180,
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
            >
              {track.title}
            </a>
            <span style={{ fontSize: 12, color: 'var(--text-ghost)', flexShrink: 0 }}>
              — {track.artist}
            </span>
          </motion.div>
        ) : (
          <motion.span
            key="not-playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: 12, color: 'var(--text-ghost)' }}
          >
            Not playing
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
