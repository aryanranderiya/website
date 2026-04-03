import SocialsGrid from './SocialsGrid';
import { HugeiconsIcon, Folder03Icon, QuillWrite01Icon, Clock01Icon } from '@icons';
import type { ComponentType } from 'react';
import type { IconProps } from '@theexperiencecompany/gaia-icons';

function SpotifyLink() {
  return (
    <a
      href="https://open.spotify.com/playlist/1kDa0wKgm0baT3550xsURH"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[3px] no-underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
    >
      <img
        src="https://cdn.simpleicons.org/spotify/1DB954"
        width={11}
        height={11}
        alt="Spotify"
        className="inline shrink-0 align-middle"
      />
      <span>playlist</span>
    </a>
  );
}


export default function Hero() {
  return (
    <section className="pt-4 pb-12">
      {/* Headline */}
      <h1 className="animate-fade-in stagger-1 text-[36px] font-semibold tracking-[-0.035em] leading-[1.1] text-[var(--text-primary)] m-0 mb-4">
        Hey! Welcome to
        <br />
        my digital world.
      </h1>

      {/* Bio - Intro */}
      <p className="animate-fade-in stagger-2 text-[14px] text-[var(--text-muted)] max-w-[440px] leading-[1.65] m-0 mb-3">
        My name is{' '}
        <img src="/avatar.webp" alt="Aryan Randeriya" className="inline align-middle rounded-full w-auto h-[1.4em] mb-[2px] mx-[4px]" />{' '}
        Aryan Randeriya and I'm a Designer, Developer, and the founder of{' '}
        <img src="https://github.com/theexperiencecompany.png" alt="The Experience Company" className="inline align-middle rounded-full w-auto h-[1.1em] mb-[1px] mx-[3px]" />{' '}
        The Experience Company. The name comes from two things: our belief that our mission is to improve the human experience, and our deep care about the experience of every product we build.
      </p>

      {/* Bio - GAIA */}
      <p className="animate-fade-in stagger-2 text-[14px] text-[var(--text-muted)] max-w-[440px] leading-[1.65] m-0 mb-3">
        Currently building{' '}
        <img src="/gaia-logo.png" alt="GAIA" className="inline align-middle rounded-full w-auto h-[1.1em] mb-[1px] mx-[3px]" />{' '}
        GAIA - a proactive personal AI assistant that acts before you even need to ask. The goal: every person in the world should have their own truly intelligent assistant.
      </p>

      {/* Bio - Personal */}
      <p className="animate-fade-in stagger-3 text-[14px] text-[var(--text-muted)] max-w-[440px] leading-[1.65] m-0 mb-3">
        I'm a tech nerd who's been tinkering with computers since a very young age. Born in{' '}
        <img src="https://em-content.zobj.net/source/apple/118/flag-for-united-kingdom_1f1ec-1f1e7.png" alt="UK" className="inline align-middle w-auto h-[1em] mb-[1px]" />{' '}
        the United Kingdom, based in{' '}
        <img src="https://em-content.zobj.net/source/apple/118/flag-for-india_1f1ee-1f1f3.png" alt="India" className="inline align-middle w-auto h-[1em] mb-[1px]" />{' '}
        India. I love building products - I'm a product guy but a developer and designer by heart. I love music - fun fact, I have a <SpotifyLink /> with 2000+ songs. I absolutely love movies and am extremely passionate about them. I also love food - I love trying different cuisines and having a variety of different foods. I love tinkering around with code and shipping things and exploring new things - maybe that's the ADHD too, lol.
      </p>

      {/* Bio - Areas to explore */}
      <p className="animate-fade-in stagger-3 text-[14px] text-[var(--text-muted)] max-w-[440px] leading-[1.65] m-0 mb-7">
        Some things I want to explore: Rust, hardware, robotics, energy infrastructure, personal companions and smart wearables (both through GAIA), and low-level programming - hardcore C, OS internals, all of that.
      </p>

      {/* Links */}
      <div className="animate-fade-in stagger-4 flex gap-2 mb-6 flex-wrap">
        {(
          [
            { label: 'Work', href: '/projects', icon: Folder03Icon },
            { label: 'Blog', href: '/blog',     icon: QuillWrite01Icon },
            { label: 'Now',  href: '/now',      icon: Clock01Icon },
          ] as { label: string; href: string; icon: ComponentType<IconProps> }[]
        ).map(({ label, href, icon }) => (
          <a
            key={href}
            href={href}
            className="text-[12px] text-[var(--text-secondary)] no-underline inline-flex items-center gap-[5px] bg-[var(--muted-bg)] rounded-[10px] px-3 py-[5px] font-medium transition-[filter] duration-150 hover:brightness-[0.96]"
          >
            <HugeiconsIcon icon={icon} size={12} color="currentColor" />
            {label}
          </a>
        ))}
      </div>

      {/* Socials */}
      <SocialsGrid />
    </section>
  );
}
