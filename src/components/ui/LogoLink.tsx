interface LogoLinkProps {
	href: string;
	logo: string;
	name: string;
	hoverTextClass?: string;
	logoClassName?: string;
	rounded?: boolean;
}

export function LogoLink({
	href,
	logo,
	name,
	hoverTextClass,
	logoClassName,
	rounded = true,
}: LogoLinkProps) {
	const isGaia = logo === '/gaia-logo.webp';
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" className="group">
			<img
				src={logo}
				alt={name}
				width={isGaia ? 24 : 20}
				height={isGaia ? 24 : 20}
				className={`mb-px inline h-[1.1em] w-auto align-middle ml-1${rounded ? 'rounded-full' : ''}${logoClassName ? ` ${logoClassName}` : ''}`}
			/>{' '}
			<span
				className={`font-medium underline decoration-dotted underline-offset-4 transition group-hover:text-foreground ${hoverTextClass ?? ''}`}
			>
				{name}
			</span>
		</a>
	);
}
