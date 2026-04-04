interface LogoLinkProps {
  href: string;
  logo: string;
  name: string;
  hoverTextClass?: string;
  logoClassName?: string;
  rounded?: boolean;
}

export function LogoLink({ href, logo, name, hoverTextClass, logoClassName, rounded = true }: LogoLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group">
      <img
        src={logo}
        alt={name}
        className={`inline align-middle w-auto h-[1.1em] mb-px ml-1${rounded ? " rounded-full" : ""}${logoClassName ? ` ${logoClassName}` : ""}`}
      />{" "}
      <span
        className={`font-medium underline underline-offset-4 decoration-dotted transition group-hover:text-foreground ${hoverTextClass ?? ""}`}
      >
        {name}
      </span>
    </a>
  );
}
