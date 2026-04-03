interface LogoLinkProps {
  href: string;
  logo: string;
  name: string;
  hoverTextClass?: string;
}

export function LogoLink({ href, logo, name, hoverTextClass }: LogoLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group">
      <img
        src={logo}
        alt={name}
        className="inline align-middle rounded-full w-auto h-[1.1em] mb-px ml-1"
      />{" "}
      <span
        className={`font-medium underline underline-offset-4 decoration-dotted transition group-hover:text-foreground ${hoverTextClass ?? ""}`}
      >
        {name}
      </span>
    </a>
  );
}
