import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { wgSlugs } from './data/working-groups';

const person = z.object({
  name: z.string(),
  org: z.string(),
  github: z.string().optional(),
});

// Technical notes: one Markdown file per note, in the working group's folder.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string().max(120),
    description: z.string().max(300),
    wg: z.enum(wgSlugs),
    authors: z.array(person).min(1),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    label: z.enum(['working-draft', 'guidance', 'reviewed']),
    route: z.enum(['recommendation', 'informational', 'working-document', 'incubating-specification', 'upstream', 'shared-vocabulary']),
    source: z.string().url(),
    discussion: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    example: z.boolean().default(false),
    draft: z.boolean().default(false),
  }).refine((n) => n.label !== 'reviewed' || n.route === 'recommendation', {
    message: 'Only a Recommendation that has completed the full publication track can use the "reviewed" label.',
    path: ['label'],
  }),
});

// Skills catalog: one YAML file per skill. AAIF links to the source and does not host copies.
const skills = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/skills' }),
  schema: z.object({
    name: z.string().max(80),
    description: z.string().max(300),
    source: z.string().url(),
    path: z.string().optional(),
    version: z.string(),
    license: z.string(),
    maintainer: person,
    status: z.enum(['listed', 'reviewed', 'wg-maintained']).default('listed'),
    reviewedBy: z.enum(wgSlugs).optional(),
    executable: z.boolean(),
    tags: z.array(z.string()).default([]),
    added: z.coerce.date(),
    example: z.boolean().default(false),
  }).refine((s) => s.status === 'listed' || s.reviewedBy, {
    message: 'Skills marked "reviewed" or "wg-maintained" must name the working group in reviewedBy.',
    path: ['reviewedBy'],
  }),
});

export const collections = { notes, skills };
