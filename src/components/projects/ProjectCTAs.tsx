'use client';

import { CircleArrowUpRight02Icon, GithubIcon, HugeiconsIcon } from '@icons';
import { RaisedButton } from '@/components/ui/raised-button';

interface Props {
	url?: string;
	github?: string;
}

export default function ProjectCTAs({ url, github }: Props) {
	if (!url && !github) return null;
	return (
		<div className="flex items-center gap-2">
			{url && (
				<RaisedButton asChild variant="default" size="sm">
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="gap-1.5 no-underline"
					>
						Visit
						<HugeiconsIcon icon={CircleArrowUpRight02Icon} size={13} />
					</a>
				</RaisedButton>
			)}
			{github && (
				<RaisedButton asChild variant="outline" size="sm">
					<a
						href={github}
						target="_blank"
						rel="noopener noreferrer"
						className="gap-1.5 no-underline"
					>
						<HugeiconsIcon icon={GithubIcon} size={13} />
						GitHub
					</a>
				</RaisedButton>
			)}
		</div>
	);
}
