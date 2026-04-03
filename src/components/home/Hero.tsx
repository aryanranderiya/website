import { motion } from "framer-motion";
import SocialsGrid from "./SocialsGrid";
import { LogoLink } from "@/components/ui/LogoLink";
import { HugeiconsIcon, Folder03Icon, QuillWrite01Icon, Clock01Icon } from "@icons";
import { useAfterPreloader } from "@/hooks/useAfterPreloader";
import type { ComponentType } from "react";
import type { IconProps } from "@theexperiencecompany/gaia-icons";

const paraBase = "text-[14px] text-[var(--text-muted)] leading-[1.65] m-0";
const paraWide = `${paraBase} max-w-2xl`;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const EASE = [0.19, 1, 0.22, 1] as const;

const item = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE },
  },
};

export default function Hero() {
  const ready = useAfterPreloader();

  return (
    <motion.section
      className="pt-4 pb-12"
      variants={container}
      initial="hidden"
      animate={ready ? "show" : "hidden"}
    >
      <motion.h1
        variants={item}
        className="text-[36px] font-semibold tracking-[-0.035em] leading-[1.1] text-[var(--text-primary)] m-0 mb-4"
      >
        Hey! Welcome to my digital world.
      </motion.h1>

      <motion.p variants={item} className={`mb-3 ${paraWide}`}>
        My name is
        <img
          src="/avatar.webp"
          alt="Aryan Randeriya"
          className="inline align-middle rounded-full w-auto h-[1.4em] mb-0.5 ml-2"
        />{" "}
        Aryan Randeriya and I'm a Designer, Developer, and the Founder & CEO of
        <LogoLink
          href="https://experience.heygaia.io"
          logo="/images/theexperiencecompany.webp"
          name="The Experience Company"
        />
        . The name comes from two things: our belief that our mission is to
        improve the human experience, and our deep care about the experience of
        every product we build.
      </motion.p>

      <motion.p variants={item} className={`mb-3 ${paraWide}`}>
        Currently building{" "}
        <LogoLink href="https://heygaia.io" logo="/gaia-logo.png" name="GAIA" />
        - a proactive personal AI assistant that acts before you even need to
        ask. The goal: every person in the world should have their own truly
        intelligent assistant.
      </motion.p>

      <motion.p variants={item} className={`mb-3 ${paraWide}`}>
        I'm a tech nerd who's been tinkering with computers since a very young
        age.
        <br />
        Born in{" "}
        <img
          src="/images/flag-uk.webp"
          alt="UK"
          className="inline align-middle w-auto h-[1em] mb-[1px]"
        />{" "}
        the United Kingdom, based in{" "}
        <img
          src="/images/flag-india.webp"
          alt="India"
          className="inline align-middle w-auto h-[1em] mb-[1px]"
        />{" "}
        India. I love building products - I'm a product guy but a developer and
        designer by heart. I love music - fun fact, I have a{" "}
        <LogoLink
          href="https://open.spotify.com/playlist/1kDa0wKgm0baT3550xsURH"
          logo="https://cdn.simpleicons.org/spotify/1DB954"
          name="Spotify playlist"
        />{" "}
        with 2000+ songs. I absolutely love movies and am extremely passionate
        about them. I also love food - I love trying different cuisines and
        having a variety of different foods. I love tinkering around with code
        and shipping things and exploring new things - maybe that's the ADHD
        too, lol.
      </motion.p>

      <motion.p variants={item} className={`mb-7 ${paraWide}`}>
        Some things I want to explore: Rust, hardware, robotics, energy
        infrastructure, personal companions and smart wearables (both through
        GAIA), and low-level programming - hardcore C, OS internals, all of
        that.
      </motion.p>

      <motion.div variants={item} className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            { label: "Work", href: "/projects", icon: Folder03Icon },
            { label: "Blog", href: "/blog", icon: QuillWrite01Icon },
            { label: "Now", href: "/now", icon: Clock01Icon },
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
      </motion.div>

      <motion.div variants={item}>
        <SocialsGrid />
      </motion.div>
    </motion.section>
  );
}
