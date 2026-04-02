export interface Experience {
  company: string;
  role: string;
  employmentType: 'full-time' | 'internship' | 'freelance' | 'volunteer' | 'contract';
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  highlights: string[];
  logo?: string;       // clearbit URL or manual
  website?: string;
  skills: string[];
  featured?: boolean;  // show on home page
}

export const experience: Experience[] = [
  {
    company: 'The Experience Company',
    role: 'Founder & CEO',
    employmentType: 'full-time',
    startDate: 'Jan 2025',
    endDate: 'Present',
    location: 'Remote',
    description: 'Building GAIA — an AI-powered personal companion platform. Designed and developed end-to-end.',
    highlights: [
      'Built React Native + TypeScript mobile app with voice-first UX',
      'Python/FastAPI backend with OpenAI integrations and custom models',
      'Selected for buildspace nights & weekends S5',
      'Designed the full product experience from 0 → 1',
    ],
    logo: 'https://www.google.com/s2/favicons?domain=heygaia.io&sz=128',
    website: 'https://heygaia.io',
    skills: ['React Native', 'TypeScript', 'Python', 'FastAPI', 'OpenAI'],
    featured: true,
  },
  {
    company: 'IGNOSIS',
    role: 'Software Engineer',
    employmentType: 'full-time',
    startDate: '2024',
    endDate: 'Present',
    location: 'Remote',
    description: 'Full-stack software engineering at an AI company. Building production systems and integrations.',
    highlights: [],
    logo: 'https://www.google.com/s2/favicons?domain=ignosis.ai&sz=128',
    website: 'https://ignosis.ai',
    skills: ['TypeScript', 'React', 'Python', 'FastAPI'],
    featured: true,
  },
  {
    company: 'Encode PDEU',
    role: 'Head of Web Development',
    employmentType: 'volunteer',
    startDate: 'Jul 2024',
    endDate: 'Present',
    location: 'PDEU, Ahmedabad',
    description: 'Leading web development for Encode — the Computer Science club at Pandit Deendayal Energy University.',
    highlights: [
      'Built and shipped the official Encode club website',
      'Mentored junior developers in React and modern web practices',
      'Organized coding events and hackathons for 200+ students',
    ],
    logo: 'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Encode_Official%20Website/encode.png',
    website: 'https://encodepdeu.vercel.app',
    skills: ['React', 'Node.js', 'MongoDB'],
    featured: true,
  },
  {
    company: 'Developer Student Clubs PDEU',
    role: 'Head of Web Development',
    employmentType: 'volunteer',
    startDate: 'Sep 2024',
    endDate: 'Present',
    location: 'PDEU, Ahmedabad',
    description: 'Leading web development for the Google Developer Student Club at PDEU.',
    highlights: [],
    logo: 'https://www.google.com/s2/favicons?domain=gdsc.community.dev&sz=128',
    skills: ['React', 'TypeScript'],
    featured: false,
  },
  {
    company: 'Rezrek',
    role: 'Full Stack Developer',
    employmentType: 'internship',
    startDate: 'May 2024',
    endDate: 'Present',
    location: 'Remote',
    description: 'Built Rezrek — a content e-commerce platform.',
    highlights: [
      'End-to-end development of content e-commerce platform',
      'React, Node.js, Redis stack',
    ],
    logo: 'https://storage.googleapis.com/aryanranderiya-portfolio.appspot.com/ProjectMedia/Rezrek/image%20(1).png',
    website: 'https://rezrek.vercel.app',
    skills: ['React', 'Node.js', 'Redis', 'MongoDB'],
    featured: true,
  },
  {
    company: 'Govardhan Infotech',
    role: 'Android Development Intern',
    employmentType: 'internship',
    startDate: 'Jan 2023',
    endDate: 'Jul 2023',
    location: 'Surat, India',
    description: '6-month Android development internship building native Android applications.',
    highlights: [],
    logo: 'https://www.google.com/s2/favicons?domain=govardhaninfotech.com&sz=128',
    skills: ['Android', 'Java', 'Kotlin'],
    featured: false,
  },
  {
    company: 'Freelance',
    role: 'Full-Stack Developer & Designer',
    employmentType: 'freelance',
    startDate: '2022',
    endDate: 'Present',
    location: 'Remote',
    description: 'Independent contractor building web and mobile products for startups and individuals.',
    highlights: [
      'BlinkAnalytics — analytics dashboard (React, TypeScript)',
      'MWI — brand and web presence (Next.js, TypeScript)',
      'Brushstroke Studio — agency website (Astro)',
      'LyfeLane — platform MVP (React, Node.js)',
    ],
    logo: undefined,
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Figma'],
    featured: false,
  },
];

export const education = [
  {
    institution: 'Pandit Deendayal Energy University',
    shortName: 'PDEU',
    degree: 'B.Tech',
    field: 'Computer Science Engineering',
    startYear: '2023',
    endYear: '2026',
    location: 'Ahmedabad, India',
    logo: 'https://www.google.com/s2/favicons?domain=pdeu.ac.in&sz=128',
  },
  {
    institution: 'Gujarat Technological University',
    shortName: 'GTU',
    degree: 'Diploma',
    field: 'Computer Engineering',
    startYear: '2020',
    endYear: '2023',
    location: 'Gujarat, India',
    logo: 'https://www.google.com/s2/favicons?domain=gtu.ac.in&sz=128',
  },
];

export const certifications = [
  {
    name: 'Introduction to Programming Using Python',
    issuer: 'Harvard University (CS50)',
    date: 'Mar 2025',
    url: 'https://certificates.cs50.io/4ffef9c2-3560-40de-a8eb-e0a420fe6a14.pdf?size=letter',
  },
];
