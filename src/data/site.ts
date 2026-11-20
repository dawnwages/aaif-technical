// Navigation and footer, copied from aaif.io (November 2026).
// This is the one file to update when aaif.io's menu changes. When marketing
// shares the aaif.io header and footer components, replace Header.astro and
// Footer.astro with them and keep this file as their data.

const AAIF = 'https://aaif.io';

export const logo = {
  src: 'https://cdn.sanity.io/images/4o10fa7h/production/16dd7d8270b673d376cadca831ab3d5ea003bb89-838x203.svg',
  alt: 'Agentic AI Foundation Logo',
  href: AAIF + '/',
};

export type NavItem = { label: string; href?: string; children?: { label: string; href: string; internal?: boolean }[] };

// Paths marked internal belong to this site and are resolved against BASE_PATH.
export const nav: NavItem[] = [
  { label: 'About AAIF', href: AAIF + '/about' },
  { label: 'Projects', href: AAIF + '/projects' },
  { label: 'Events', href: AAIF + '/events' },
  {
    label: 'Resources',
    children: [
      { label: 'Blog', href: AAIF + '/blog' },
      { label: 'Technical Notes', href: '/notes/', internal: true },
      { label: 'Skills Catalog', href: '/skills/', internal: true },
      { label: 'Video', href: AAIF + '/video' },
      { label: 'News', href: AAIF + '/news' },
      { label: 'Landscape', href: 'https://landscape.aaif.io/' },
      { label: 'Brand', href: AAIF + '/brand' },
    ],
  },
];

export const cta = { label: 'Join AAIF', href: AAIF + '/members#join' };

export const social = [
  { label: 'X', href: 'https://x.com/AgenticAIFdn' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/agentic-ai-foundation' },
  { label: 'YouTube', href: 'https://www.youtube.com/@AgenticAI-Foundation' },
  { label: 'GitHub', href: 'https://github.com/aaif' },
  { label: 'Discord', href: 'https://discord.com/invite/9zTwngHAMy' },
];

export const footerColumns = [
  {
    heading: 'Explore',
    links: [
      { label: 'About AAIF', href: AAIF + '/about' },
      { label: 'Events', href: AAIF + '/events' },
      { label: 'Governing Board', href: AAIF + '/board' },
      { label: 'Members', href: AAIF + '/members' },
      { label: 'Technical Committee', href: AAIF + '/tc' },
      { label: 'Staff', href: AAIF + '/staff' },
    ],
  },
  {
    heading: 'Get Involved',
    links: [
      { label: 'Join Working group', href: AAIF + '/members#join' },
      { label: 'Technical Awards', href: AAIF + '/awards' },
      { label: 'Submit a Project', href: AAIF + '/submit-article' },
      { label: 'Become an ambassador', href: AAIF + '/learn-more-about-the-program' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: AAIF + '/blog' },
      { label: 'Technical Notes', href: '/notes/', internal: true },
      { label: 'Skills Catalog', href: '/skills/', internal: true },
      { label: 'Video', href: AAIF + '/video' },
      { label: 'News', href: AAIF + '/news' },
      { label: 'Landscape', href: 'https://landscape.aaif.io/' },
      { label: 'Brand', href: AAIF + '/brand' },
      { label: 'Merch', href: 'https://merch.aaif.io/' },
    ],
  },
] as { heading: string; links: { label: string; href: string; internal?: boolean }[] }[];

// Footer copy is aaif.io's own, kept verbatim so the footer matches.
export const newsletter = {
  heading: 'Newsletter Opt-In',
  text: 'Get weekly intelligence on agentic AI standards and governance.',
  button: 'Subscribe',
  href: AAIF + '/#subscribe-modal',
};

export const legal = {
  copyright: 'Copyright © The Linux Foundation®. All rights reserved.',
  trademark: 'The Linux Foundation has registered trademarks and uses trademarks.',
  policiesLead: 'For more information, including terms of use, privacy policy, and trademark usage, please see our',
  policiesHref: 'https://www.linuxfoundation.org/legal/policies',
};
