// The working groups and workstream that can publish technical notes.
// The slug is the folder name under src/content/notes/ and the value of `wg`
// in a note's front matter.

export const workingGroups = [
  { slug: 'accuracy-and-reliability', name: 'Accuracy & Reliability', repo: 'https://github.com/aaif/wg-accuracy-and-reliability' },
  { slug: 'agentic-commerce', name: 'Agentic Commerce', repo: 'https://github.com/aaif/wg-agentic-commerce' },
  { slug: 'governance-risk-and-regulatory', name: 'Governance, Risk & Regulatory Alignment', repo: 'https://github.com/aaif/wg-governance-risk-and-regulatory' },
  { slug: 'identity-and-trust', name: 'Identity & Trust', repo: 'https://github.com/aaif/wg-identity-and-trust' },
  { slug: 'observability-and-traceability', name: 'Observability & Traceability', repo: 'https://github.com/aaif/wg-observability-and-traceability' },
  { slug: 'security-and-privacy', name: 'Security & Privacy', repo: 'https://github.com/aaif/wg-security-and-privacy' },
  { slug: 'taxonomy-landscape', name: 'Taxonomy & Landscape', repo: 'https://github.com/aaif/ws-taxonomy-landscape' },
  { slug: 'workflows-and-process-integration', name: 'Workflows & Process Integration', repo: 'https://github.com/aaif/wg-workflows-and-process-integration' },
] as const;

export type WgSlug = (typeof workingGroups)[number]['slug'];
export const wgSlugs = workingGroups.map((w) => w.slug) as [WgSlug, ...WgSlug[]];
export const wgName = (slug: string) => workingGroups.find((w) => w.slug === slug)?.name ?? slug;

// Labels for notes, from the WG output RFC. "reviewed" only after a
// Recommendation completes the full publication track.
export const noteLabels = {
  'working-draft': { name: 'Working draft', help: 'Work in progress. Not yet reviewed by chairs outside the group.' },
  guidance: { name: 'Guidance', help: 'Signed off by the group and peer reviewed by a chair from another working group.' },
  reviewed: { name: 'Reviewed', help: 'Completed the full publication track, including public comment and TC review.' },
} as const;

// Review levels for the skills catalog.
export const skillStatuses = {
  listed: { name: 'Listed', help: 'Passed automated checks. Not reviewed by AAIF or a working group.' },
  reviewed: { name: 'Reviewed', help: 'Reviewed by the working group that covers its area, against that group’s published criteria.' },
  'wg-maintained': { name: 'WG maintained', help: 'Contributed and maintained by a working group.' },
} as const;
