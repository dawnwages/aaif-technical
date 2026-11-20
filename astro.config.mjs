// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH let the same repo deploy to GitHub Pages for review
// and later to aaif.io (for example https://aaif.io with BASE_PATH=/technical).
const site = process.env.SITE_URL ?? 'https://aaif.io';
const base = process.env.BASE_PATH ?? '/technical';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
