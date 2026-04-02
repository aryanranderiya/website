'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const AVATAR_URL = 'https://github.com/aryanranderiya.png';

// --- SVG Icons ---

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.622 5.906-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24c3.259 0 3.668-.014 4.948-.072 1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z" />
  </svg>
);

const KeyboardIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M5 4v3H0v10h24V7h-5V4H5zm2 2h10v1H7V6zm-5 3h20v8H2V9zm2 2v4h2v-4H4zm4 0v4h2v-4H8zm4 0v4h2v-4h-2zm4 0v4h2v-4h-2z" />
  </svg>
);

const RepoIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
    <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.873 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

// --- Mini bar chart for GitHub contribution preview ---
// 20 bars representing rough weekly commit activity
const MOCK_CONTRIBUTION_BARS = [2, 5, 3, 8, 4, 6, 9, 3, 7, 5, 4, 8, 6, 10, 7, 9, 5, 8, 6, 4];

function MiniContributionGraph() {
  const max = Math.max(...MOCK_CONTRIBUTION_BARS);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '28px' }}>
      {MOCK_CONTRIBUTION_BARS.map((val, i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: `${(val / max) * 28}px`,
            borderRadius: '2px',
            backgroundColor: `rgba(35, 134, 54, ${0.3 + (val / max) * 0.7})`,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// --- Instagram gradient ---
const INSTAGRAM_GRADIENT = 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';

// --- Preview card components ---

function GitHubPreview() {
  return (
    <div
      style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '16px',
        width: '260px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#e6edf3',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <img
          src={AVATAR_URL}
          alt="avatar"
          width={40}
          height={40}
          style={{ borderRadius: '50%', border: '2px solid #30363d', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#e6edf3', lineHeight: 1.3 }}>Aryan Randeriya</div>
          <div style={{ fontSize: '12px', color: '#8b949e', lineHeight: 1.3 }}>@aryanranderiya</div>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontSize: '12px', color: '#8b949e', lineHeight: 1.5, margin: '0 0 10px' }}>
        Developer, designer, and builder. Interested in hardware, robotics, and HCI.
      </p>

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
        <span style={{ color: '#8b949e' }}><LocationIcon /></span>
        <span style={{ fontSize: '12px', color: '#8b949e' }}>Ahmedabad, India</span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid #21262d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#8b949e' }}><RepoIcon /></span>
          <span style={{ fontSize: '12px', color: '#e6edf3', fontWeight: 600 }}>50+</span>
          <span style={{ fontSize: '12px', color: '#8b949e' }}>repos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#8b949e' }}><StarIcon /></span>
          <span style={{ fontSize: '12px', color: '#e6edf3', fontWeight: 600 }}>120</span>
          <span style={{ fontSize: '12px', color: '#8b949e' }}>followers</span>
        </div>
      </div>

      {/* Mini contribution graph */}
      <div>
        <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '6px' }}>Contributions this year</div>
        <MiniContributionGraph />
      </div>
    </div>
  );
}

function TwitterPreview() {
  return (
    <div
      style={{
        background: '#000000',
        border: '1px solid #2f3336',
        borderRadius: '12px',
        padding: '16px',
        width: '260px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#e7e9ea',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <img
          src={AVATAR_URL}
          alt="avatar"
          width={40}
          height={40}
          style={{ borderRadius: '50%', border: '2px solid #2f3336', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#e7e9ea', lineHeight: 1.3 }}>Aryan Randeriya</div>
          <div style={{ fontSize: '12px', color: '#71767b', lineHeight: 1.3 }}>@aryanranderiya</div>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontSize: '13px', color: '#e7e9ea', lineHeight: 1.5, margin: '0 0 14px' }}>
        Building things. Developer &amp; designer. Interested in HCI and robotics.
      </p>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: '18px',
          paddingTop: '10px',
          borderTop: '1px solid #2f3336',
        }}
      >
        <div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#e7e9ea' }}>234 </span>
          <span style={{ fontSize: '13px', color: '#71767b' }}>Following</span>
        </div>
        <div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#e7e9ea' }}>512 </span>
          <span style={{ fontSize: '13px', color: '#71767b' }}>Followers</span>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview() {
  return (
    <div
      style={{
        background: '#1b1f23',
        border: '1px solid #283339',
        borderRadius: '12px',
        padding: '0',
        width: '260px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#e7e9ea',
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}
    >
      {/* Banner */}
      <div
        style={{
          height: '52px',
          background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
        }}
      />

      {/* Avatar + content */}
      <div style={{ padding: '0 16px 16px', position: 'relative' }}>
        <img
          src={AVATAR_URL}
          alt="avatar"
          width={48}
          height={48}
          style={{
            borderRadius: '50%',
            border: '3px solid #1b1f23',
            position: 'absolute',
            top: '-24px',
            left: '16px',
          }}
        />

        <div style={{ paddingTop: '30px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#e7e9ea', marginBottom: '2px' }}>Aryan Randeriya</div>
          <div style={{ fontSize: '12px', color: '#a8a8a8', marginBottom: '10px', lineHeight: 1.4 }}>
            Developer &amp; Designer
          </div>

          <div style={{ fontSize: '12px', color: '#a8a8a8', lineHeight: 1.5, marginBottom: '8px' }}>
            Student at Nirma University
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#a8a8a8' }}><LocationIcon /></span>
            <span style={{ fontSize: '12px', color: '#a8a8a8' }}>Ahmedabad, India</span>
          </div>
        </div>
      </div>

      {/* Footer accent */}
      <div
        style={{
          borderTop: '1px solid #283339',
          padding: '10px 16px',
          background: 'rgba(0, 119, 181, 0.08)',
        }}
      >
        <span style={{ fontSize: '12px', color: '#0077b5', fontWeight: 600 }}>View full profile</span>
      </div>
    </div>
  );
}

function InstagramPreview() {
  return (
    <div
      style={{
        background: '#000000',
        border: '1px solid #262626',
        borderRadius: '12px',
        padding: '16px',
        width: '260px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#f5f5f5',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        {/* Gradient ring avatar */}
        <div
          style={{
            padding: '2px',
            borderRadius: '50%',
            background: INSTAGRAM_GRADIENT,
            flexShrink: 0,
          }}
        >
          <div style={{ background: '#000', borderRadius: '50%', padding: '2px' }}>
            <img
              src={AVATAR_URL}
              alt="avatar"
              width={36}
              height={36}
              style={{ borderRadius: '50%', display: 'block' }}
            />
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#f5f5f5', lineHeight: 1.3 }}>aryanranderiya</div>
          <div style={{ fontSize: '12px', color: '#a8a8a8', lineHeight: 1.3 }}>Aryan Randeriya</div>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontSize: '12px', color: '#f5f5f5', lineHeight: 1.5, margin: '0 0 10px' }}>
        Developer. Designer. Builder.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px' }}>
        <span style={{ color: '#a8a8a8' }}><LocationIcon /></span>
        <span style={{ fontSize: '12px', color: '#a8a8a8' }}>Ahmedabad</span>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          paddingTop: '12px',
          borderTop: '1px solid #262626',
        }}
      >
        {[
          { value: '47', label: 'posts' },
          { value: '890', label: 'followers' },
          { value: '320', label: 'following' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              borderRight: i < 2 ? '1px solid #262626' : 'none',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#f5f5f5' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#a8a8a8' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonkeytypePreview() {
  return (
    <div
      style={{
        background: '#323437',
        border: '1px solid #2c2e31',
        borderRadius: '12px',
        padding: '16px',
        width: '240px',
        fontFamily: '"Roboto Mono", "Courier New", monospace',
        color: '#d1d0c5',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* Monkeytype header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <KeyboardIcon />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2b714', letterSpacing: '-0.02em' }}>
            monkeytype
          </div>
          <div style={{ fontSize: '11px', color: '#646669' }}>aryanranderiya</div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          paddingTop: '12px',
          borderTop: '1px solid #2c2e31',
        }}
      >
        {[
          { label: 'wpm', value: '95' },
          { label: 'acc', value: '97%' },
          { label: 'tests', value: '1,247' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#e2b714', lineHeight: 1.2 }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#646669', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar teaser */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '10px', color: '#646669', marginBottom: '5px' }}>best 60s wpm</div>
        <div style={{ height: '4px', borderRadius: '2px', background: '#2c2e31', overflow: 'hidden' }}>
          <div
            style={{
              width: '72%',
              height: '100%',
              borderRadius: '2px',
              background: '#e2b714',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '10px', color: '#646669', marginTop: '3px', textAlign: 'right' }}>108 wpm</div>
      </div>
    </div>
  );
}

// --- Social link data ---
interface SocialItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
}

const SOCIALS: SocialItem[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/aryanranderiya',
    icon: <GitHubIcon />,
    preview: <GitHubPreview />,
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    href: 'https://twitter.com/aryanranderiya',
    icon: <TwitterIcon />,
    preview: <TwitterPreview />,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/aryanranderiya',
    icon: <LinkedInIcon />,
    preview: <LinkedInPreview />,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/aryanranderiya',
    icon: <InstagramIcon />,
    preview: <InstagramPreview />,
  },
  {
    id: 'monkeytype',
    label: 'Monkeytype',
    href: 'https://monkeytype.com/profile/aryanranderiya',
    icon: <KeyboardIcon />,
    preview: <MonkeytypePreview />,
  },
];

// --- Preview card wrapper with smart positioning ---
interface PreviewCardProps {
  visible: boolean;
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

function PreviewCard({ visible, children, anchorRef }: PreviewCardProps) {
  const [above, setAbove] = useState(true);

  useEffect(() => {
    if (!visible || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    // If the anchor is within ~320px from the top, show below instead
    setAbove(rect.top > 320);
  }, [visible, anchorRef]);

  return (
    <div
      style={{
        position: 'absolute',
        [above ? 'bottom' : 'top']: 'calc(100% + 10px)',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : above ? '6px' : '-6px'})`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        zIndex: 100,
        // Keep card on screen horizontally
        maxWidth: '92vw',
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          [above ? 'bottom' : 'top']: above ? '-5px' : '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          ...(above
            ? { borderTop: '6px solid #30363d' }
            : { borderBottom: '6px solid #30363d' }),
          zIndex: 101,
        }}
      />
      {children}
    </div>
  );
}

// --- Single social link item ---
function SocialItem({ social }: { social: SocialItem }) {
  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  return (
    <div
      ref={anchorRef}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '7px 13px',
          borderRadius: '999px',
          border: '1px solid var(--border)',
          background: hovered ? 'var(--muted)' : 'transparent',
          color: hovered ? 'var(--foreground)' : 'var(--muted-foreground)',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 500,
          lineHeight: 1,
          transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', opacity: hovered ? 1 : 0.7, transition: 'opacity 0.15s' }}>
          {social.icon}
        </span>
        {social.label}
        <span style={{ opacity: 0.35, display: 'flex', alignItems: 'center' }}>
          <ExternalLinkIcon />
        </span>
      </a>

      <PreviewCard visible={hovered} anchorRef={anchorRef}>
        {social.preview}
      </PreviewCard>
    </div>
  );
}

// --- Main export ---
export default function SocialsGrid() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      {SOCIALS.map((social) => (
        <SocialItem key={social.id} social={social} />
      ))}
    </div>
  );
}
