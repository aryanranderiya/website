import SocialsGrid from './SocialsGrid';

export default function Hero() {
  return (
    <section className="pt-4 pb-12">
      {/* Label */}
      <div className="animate-fade-in text-[11px] text-[var(--text-ghost)] uppercase tracking-[0.07em] font-medium mb-8">
        Aryan Randeriya
      </div>

      {/* Headline */}
      <h1 className="animate-fade-in stagger-1 text-[36px] font-semibold tracking-[-0.035em] leading-[1.1] text-[var(--text-primary)] m-0 mb-4">
        Founder, designer,
        <br />
        and developer.
      </h1>

      {/* Bio */}
      <p className="animate-fade-in stagger-2 text-[14px] text-[var(--text-muted)] max-w-[440px] leading-[1.65] m-0 mb-3">
        Currently building <img src="/gaia-logo.png" alt="GAIA" className="inline align-middle rounded-full w-auto h-[1.1em] mb-[1px] mr-[3px]" /> GAIA, an AI companion for iOS and Android. Previously a freelance designer and developer working with clients across branding, product design, and web.
      </p>
      <p className="animate-fade-in stagger-3 text-[14px] text-[var(--text-muted)] max-w-[440px] leading-[1.65] m-0 mb-7">
        Born in{' '}
        <img src="https://em-content.zobj.net/source/apple/118/flag-for-united-kingdom_1f1ec-1f1e7.png" alt="UK" className="inline align-middle w-auto h-[1em] mb-[1px]" />{' '}
        England, based in{' '}
        <img src="https://em-content.zobj.net/source/apple/118/flag-for-india_1f1ee-1f1f3.png" alt="India" className="inline align-middle w-auto h-[1em] mb-[1px]" />{' '}
        India. CS graduate and design engineer who loves building things end-to-end — from the idea to the interface. I care about craft: clean code, considered design, and products that feel good to use.
      </p>

      {/* Links */}
      <div className="animate-fade-in stagger-4 flex gap-2 mb-6 flex-wrap">
        {[
          { label: 'Work', href: '/projects' },
          { label: 'Blog', href: '/blog' },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className="text-[12px] text-[var(--text-secondary)] no-underline inline-flex items-center gap-1 bg-[var(--muted-bg)] rounded-[10px] px-3 py-[5px] font-medium transition-[filter] duration-150 hover:brightness-[0.96]"
          >
            {label} →
          </a>
        ))}
      </div>

      {/* Socials */}
      <SocialsGrid />
    </section>
  );
}
