// Resolve a path on this site against BASE_PATH, so links work at /technical
// on aaif.io and at the repo path on GitHub Pages.
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : '/' + path;
  return base + clean;
}

export function link(href: string, internal?: boolean): string {
  return internal ? url(href) : href;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
