export interface NavPage {
  href: string;
  label: string;
  description: string;
  icon?: string; // hugeicons icon name
  children?: NavPage[];
  external?: boolean;
}

export const PAGES: NavPage[] = [
  {
    href: '/',
    label: 'Home',
    description: 'Start here',
    icon: 'Home01Icon',
  },
  {
    href: '/projects',
    label: 'Projects',
    description: 'Things I have built',
    icon: 'CodeIcon',
    children: [
      { href: '/projects?type=mobile', label: 'Mobile Apps', description: 'iOS and Android apps', icon: 'SmartPhone01Icon' },
      { href: '/projects?type=web', label: 'Web Apps', description: 'Web applications', icon: 'Globe02Icon' },
      { href: '/projects?type=os', label: 'Open Source', description: 'Open source contributions', icon: 'GitBranchIcon' },
    ],
  },
  {
    href: '/freelance',
    label: 'Freelance',
    description: 'Client work and services',
    icon: 'BriefcaseIcon',
  },
  {
    href: '/graphic-design',
    label: 'Graphic Design',
    description: 'Visual design work',
    icon: 'PenTool02Icon',
  },
  {
    href: '/books',
    label: 'Bookshelf',
    description: 'Books I have read and want to read',
    icon: 'Book01Icon',
    children: [
      { href: '/books#reading', label: 'Currently Reading', description: 'What I am reading now', icon: 'BookOpenIcon' },
      { href: '/books#read', label: 'Have Read', description: 'Books I have finished', icon: 'CheckmarkCircle01Icon' },
      { href: '/books#to-read', label: 'Want to Read', description: 'On my list', icon: 'BookmarkIcon' },
    ],
  },
  {
    href: '/movies',
    label: 'Movies',
    description: 'My personal Letterboxd',
    icon: 'Film01Icon',
    children: [
      { href: '/movies#watched', label: 'Watched', description: 'Movies I have seen', icon: 'Tv01Icon' },
      { href: '/movies#watchlist', label: 'Watchlist', description: 'Want to watch', icon: 'BookmarkIcon' },
    ],
  },
  {
    href: '/camera-roll',
    label: 'Camera Roll',
    description: 'Photos I have taken',
    icon: 'Camera01Icon',
  },
  {
    href: '/blog',
    label: 'Blog',
    description: 'Writing about engineering and design',
    icon: 'PenTool01Icon',
  },
  {
    href: '/resume',
    label: 'Resume',
    description: 'My work experience and skills',
    icon: 'NoteIcon',
  },
];

export const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/aryanranderiya', external: true },
  { label: 'Twitter', href: 'https://twitter.com/aryanranderiya', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aryanranderiya', external: true },
] as const;

// Flat list of all pages for CommandK and other lookups
export const ALL_PAGES_FLAT = PAGES.flatMap(page => [
  page,
  ...(page.children ?? []),
]);
