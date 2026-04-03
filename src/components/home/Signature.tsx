'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

/**
 * Letter-bank cursive signature animation for "Aryan Randeriya".
 * Each letter is an individual SVG with a handwritten path that draws on scroll.
 * Uses stroke-dasharray / stroke-dashoffset CSS transitions for smooth drawing.
 */

interface LetterDef {
  char: string;
  viewBox: string;
  width: number;
  height: number;
  path: string;
  dasharray: number;
  margin: string;
}

const LETTERS: LetterDef[] = [
  // A (uppercase)
  {
    char: 'A',
    viewBox: '0 0 46 51',
    width: 46,
    height: 51,
    path: 'M14.9987 32.0003C20.8769 23.2406 40.7942 1.02295 44.6176 1.58265C48.4411 2.14235 25.4397 26.0685 19.6688 50.0398C28.2839 11.7157 5.83642 32.6888 1.46688 33.1804C4.63512 27.4831 32.8719 20.946 44.7496 24.6628',
    dasharray: 190,
    margin: '0 -10px 0 -7px',
  },
  // r (lowercase)
  {
    char: 'r',
    viewBox: '0 0 13 51',
    width: 13,
    height: 51,
    path: 'M4.04688 23.3381L1.02539 30.1005C7.1047 22.5828 11.8527 19.8132 11.2412 24.1654',
    dasharray: 24,
    margin: '0 -3px 0 -1px',
  },
  // y (lowercase)
  {
    char: 'y',
    viewBox: '0 0 21 51',
    width: 21,
    height: 51,
    path: 'M12.7596 23.2466C11.7764 22.8447 9.49733 28.5405 10.2142 28.4672C10.931 28.3939 16.2577 23.541 16.1552 24.1849C16.7988 27.8118 2.76345 49.8665 1.16523 44.1016C0.00381581 39.4883 5.35733 40.4355 20.0861 24.6317',
    dasharray: 70,
    margin: '0 -4px 0 -9px',
  },
  // a (lowercase)
  {
    char: 'a',
    viewBox: '0 0 13 51',
    width: 13,
    height: 51,
    path: 'M5.99958 25C5.73591 21.1582 1.99899 25.5 1.49941 28C1.00013 30.5 7.65454 23.3545 7.65454 23.3545C3.5802 27.3691 3.29278 30.5313 4.09638 30.7478C5.08629 31.0263 12.2012 24.7466 12.2012 24.7466',
    dasharray: 36,
    margin: '0 -4px 0 0',
  },
  // n (lowercase)
  {
    char: 'n',
    viewBox: '0 0 15 51',
    width: 15,
    height: 51,
    path: 'M4.42188 23.1724L1.16211 28.4658C3.87099 25.9122 7.65167 23.2024 8.42922 23.7108C8.87781 23.9799 6.69468 26.9705 7.8311 27.4191C8.96753 27.8677 11.8983 25.565 14.0814 24.7575',
    dasharray: 27,
    margin: '0 -5px 0 0',
  },
];

const SPACE: 'space' = 'space';

const LETTERS_LAST_NAME: LetterDef[] = [
  // R (uppercase)
  {
    char: 'R',
    viewBox: '0 0 58 51',
    width: 58,
    height: 51,
    path: 'M12.0195 45.3685C19.1859 32.3806 23.0999 25.7226 32.0203 11.3685C21.5205 20.8685 5.01953 34.2139 1.01953 30.7139C6.01953 17.2138 71.5195 -7.28639 53.5188 13.7136C43.6613 25.2136 12.0195 41.7136 14.0195 38.2136C37.0871 17.3054 32.9838 44.188 46.7608 39.6997',
    dasharray: 235,
    margin: '0 -8px 0 -4px',
  },
  // a (lowercase)
  {
    char: 'a',
    viewBox: '0 0 13 51',
    width: 13,
    height: 51,
    path: 'M5.99958 25C5.73591 21.1582 1.99899 25.5 1.49941 28C1.00013 30.5 7.65454 23.3545 7.65454 23.3545C3.5802 27.3691 3.29278 30.5313 4.09638 30.7478C5.08629 31.0263 12.2012 24.7466 12.2012 24.7466',
    dasharray: 36,
    margin: '0 -4px 0 0',
  },
  // n (lowercase)
  {
    char: 'n',
    viewBox: '0 0 15 51',
    width: 15,
    height: 51,
    path: 'M4.42188 23.1724L1.16211 28.4658C3.87099 25.9122 7.65167 23.2024 8.42922 23.7108C8.87781 23.9799 6.69468 26.9705 7.8311 27.4191C8.96753 27.8677 11.8983 25.565 14.0814 24.7575',
    dasharray: 27,
    margin: '0 -5px 0 0',
  },
  // d (lowercase)
  {
    char: 'd',
    viewBox: '0 0 20 51',
    width: 20,
    height: 51,
    path: 'M6.08732 26.1229C8.23611 18.5681 -0.331592 27.5316 1.908 28.6301C7.01852 28.6767 10.2741 20.6086 19.1923 6.23315C9.56633 22.4841 2.35848 34.2032 2.35848 34.2032',
    dasharray: 73,
    margin: '0 -11.3px 0 0',
  },
  // e (lowercase)
  {
    char: 'e',
    viewBox: '0 0 11 51',
    width: 11,
    height: 51,
    path: 'M3.07713 25.3392C3.03314 27.7282 6.78706 24.9554 6.03999 23.505C4.44172 21.2653 -0.294204 28.3892 2.71291 28.2186C5.35941 27.9626 10.2422 24.7207 10.2422 24.7207',
    dasharray: 22,
    margin: '0 -4px 0 0',
  },
  // r (lowercase)
  {
    char: 'r',
    viewBox: '0 0 13 51',
    width: 13,
    height: 51,
    path: 'M4.04688 23.3381L1.02539 30.1005C7.1047 22.5828 11.8527 19.8132 11.2412 24.1654',
    dasharray: 24,
    margin: '0 -3px 0 -1px',
  },
  // i (lowercase)
  {
    char: 'i',
    viewBox: '0 0 9 51',
    width: 9,
    height: 51,
    path: 'M3.7548 22.9229C2.60207 23.529 -0.752212 29.5295 1.61166 28.7618C3.97553 27.994 5.61205 25.8726 7.67374 24.721',
    dasharray: 16,
    margin: '0 -3.5px 0 0',
  },
  // y (lowercase)
  {
    char: 'y',
    viewBox: '0 0 21 51',
    width: 21,
    height: 51,
    path: 'M12.7596 23.2466C11.7764 22.8447 9.49733 28.5405 10.2142 28.4672C10.931 28.3939 16.2577 23.541 16.1552 24.1849C16.7988 27.8118 2.76345 49.8665 1.16523 44.1016C0.00381581 39.4883 5.35733 40.4355 20.0861 24.6317',
    dasharray: 70,
    margin: '0 -4px 0 -9px',
  },
  // a (lowercase)
  {
    char: 'a',
    viewBox: '0 0 13 51',
    width: 13,
    height: 51,
    path: 'M5.99958 25C5.73591 21.1582 1.99899 25.5 1.49941 28C1.00013 30.5 7.65454 23.3545 7.65454 23.3545C3.5802 27.3691 3.29278 30.5313 4.09638 30.7478C5.08629 31.0263 12.2012 24.7466 12.2012 24.7466',
    dasharray: 36,
    margin: '0 -4px 0 0',
  },
];

const ALL_ITEMS: (LetterDef | 'space')[] = [
  ...LETTERS,
  SPACE,
  ...LETTERS_LAST_NAME,
];

export default function Signature() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-60px' });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isInView) {
      setAnimate(true);
    }
  }, [isInView]);

  let letterIndex = 0;

  return (
    <section className="pb-8 mt-8" style={{ height: '88px' }}>
      <div
        ref={containerRef}
        aria-label="Aryan Randeriya signature"
        className="flex flex-wrap justify-start items-center"
        style={{ transform: 'scale(1.7)', transformOrigin: '0 50%', height: '51px' }}
      >
        {ALL_ITEMS.map((item, i) => {
          if (item === 'space') {
            return (
              <div
                key={`space-${i}`}
                className="w-3 h-[51px]"
              />
            );
          }

          const currentIndex = letterIndex;
          letterIndex++;

          return (
            <div
              key={`${item.char}-${i}`}
              style={{ margin: item.margin }}
            >
              <svg
                viewBox={item.viewBox}
                height={item.height}
                width={item.width}
                className="overflow-visible"
              >
                <path
                  d={item.path}
                  fill="none"
                  stroke="var(--text-secondary)"
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: item.dasharray,
                    strokeDashoffset: animate ? 0 : item.dasharray,
                    transition: `stroke-dashoffset 0.4s cubic-bezier(0.19, 1, 0.22, 1) ${currentIndex * 0.05}s`,
                  }}
                />
              </svg>
            </div>
          );
        })}
      </div>
    </section>
  );
}
