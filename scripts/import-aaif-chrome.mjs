// Turns the raw aaif.io capture in aaif-capture/raw/ into the header, footer
// and CSS the site renders (src/aaif/). Run it after re-capturing aaif.io:
//
//   node scripts/import-aaif-chrome.mjs
//
// See aaif-capture/README.md for how to capture.
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';

const RAW = 'aaif-capture/raw/';
const OUT = 'src/aaif/';
const AAIF = 'https://aaif.io';
mkdirSync(OUT, { recursive: true });
const read = (f) => readFileSync(RAW + f, 'utf8');

// A fresh capture from aaif-capture/capture.js arrives as one JSON file; split it into raw/.
const CAPTURE = 'aaif-capture/aaif-capture.json';
if (existsSync(CAPTURE)) {
  const data = JSON.parse(readFileSync(CAPTURE, 'utf8'));
  for (const [name, content] of Object.entries(data)) {
    if (/\.(html|css)$/.test(name)) writeFileSync(RAW + name, content);
  }
  renameSync(CAPTURE, `aaif-capture/imported-${Date.now()}.json`);
  console.log(`Imported ${CAPTURE} (captured ${data.capturedAt})`);
}

// Make aaif.io-relative links and images absolute, and drop tracking attributes.
function absolutize(html) {
  return html
    .replace(/(href|src)="\/(?!\/)/g, `$1="${AAIF}/`)
    .replace(/srcset="([^"]*)"/g, (_, v) => `srcset="${v.replace(/(^|,\s*)\/(?!\/)/g, `$1${AAIF}/`)}"`)
    .replace(/ data-airgap-id="[^"]*"/g, '')
    .replace(/ aria-current="page"/g, '')
    // React's generated ids (_r_3_ and the like) change between deploys; keep them stable.
    .replace(/_r_[0-9a-z]+_/gi, '_r_x_')
    // Inline styles that hold an animation's current frame (opacity, transform) differ
    // from one capture to the next; drop them so only real changes show up.
    .replace(/ style="[^"]*\b(?:opacity|transform|translate|scale)\b[^"]*"/g, '')
    // aaif.io's HubSpot script adds tracking parameters to some links on each page load.
    .replace(/([?&])(?:__hstc|__hssc|__hsfp|_hsenc|_hsmi|utm_[a-z]+)=[^&"]*(?:&amp;|&)?/g, '$1')
    .replace(/[?&](?=")/g, '');
}

// Header, closed. The wrapper is the fixed bar holding the Linux Foundation strip and the header.
let header = absolutize(read('wrap.html'))
  .replace(/text-coral-500"><span class="text-body-sm">/g, 'text-text"><span class="text-body-sm">');
writeFileSync(OUT + 'header.html', header);

// The arrow icon aaif.io puts in its buttons (with the hover swirl), reused by Button.astro.
const icon = header.match(/Join AAIF(<div class="size-9 shrink-0 grid place-items-center relative">.*?<\/div>)<\/a>/s);
if (!icon) throw new Error('Button icon not found in header');
writeFileSync(OUT + 'button-icon.html', icon[1]);

// Dropdown panels, in their open, settled state. The site's script inserts them on click.
function panel(file, extra = []) {
  let h = absolutize(read(file))
    .replace(/ style="opacity: [^"]*"/, '')
    .replace(/whitespace-nowrap text-coral-500"/g, 'whitespace-nowrap text-neutral-500"');
  if (extra.length) {
    const item = (label, href) =>
      `<li role="none"><a data-aaif-added role="menuitem" class="p-1 font-semibold hover:text-coral-500 transition-colors whitespace-nowrap text-neutral-500" href="${href}"><span class="text-body-xs">${label}</span></a></li>`;
    h = h.replace('</ul>', extra.map(([l, href]) => item(l, href)).join('') + '</ul>');
  }
  return h;
}
writeFileSync(OUT + 'panel-about.html', panel('panel-aboutaaif.html'));
// __BASE__ is replaced with the site's base path at build time.
writeFileSync(OUT + 'panel-resources.html', panel('panel-resources.html', [
  ['Technical Notes', '__BASE__/notes/'],
  ['Skills Catalog', '__BASE__/skills/'],
]));

// Mobile menu: the full-screen backdrop and the menu section that open under the header.
const mobile = absolutize(read('mobile.html'));
const start = mobile.search(/<div[^>]*class="fixed inset-0 bg-white -z-10 lg:hidden"/);
if (start < 0) throw new Error('Mobile menu backdrop not found in mobile.html');
const secEnd = mobile.indexOf('</section>', start) + '</section>'.length;
let mobileMenu = mobile.slice(start, secEnd)
  .replace(/ style="[^"]*"/g, '')
  .replace(/cursor-pointer text-coral-500">/g, 'cursor-pointer text-neutral-500">');
writeFileSync(OUT + 'mobile-menu.html', mobileMenu);

// Footer: add the two subsite links to the Resources column, after Blog.
let footer = absolutize(read('footer.html'));
const blogLink = footer.match(/<li[^>]*><a[^>]*href="https:\/\/aaif\.io\/blog"[^>]*>.*?<\/a><\/li>/);
if (blogLink) {
  const tpl = blogLink[0];
  // data-aaif-added marks links that aren't on aaif.io, so the drift check can ignore them.
  const make = (label, href) => tpl.replace(/href="[^"]*"/, `data-aaif-added href="${href}"`).replace(/>Blog</, `>${label}<`);
  footer = footer.replace(tpl, tpl + make('Technical Notes', '__BASE__/notes/') + make('Skills Catalog', '__BASE__/skills/'));
} else {
  console.warn('Footer: Blog link not found; subsite links not added.');
}
writeFileSync(OUT + 'footer.html', footer);

// CSS: aaif.io's full compiled stylesheets, in their original order, so every
// class in the captured header, footer and page markup behaves as on aaif.io.
// aaif.io's own Instrument Sans files are served from its Next.js build without
// CORS headers, so the site loads the same font from Google Fonts instead.
let css = read('aaif-full.css');
css = css.replace(/@font-face\{font-family:Instrument Sans;[^}]*\}/g, '');
css = css.replace(/url\(\.\.\/media\//g, `url(${AAIF}/_next/static/media/`);
// Chunk file names change on every aaif.io deploy even when the CSS doesn't; drop them.
css = css.replace(/\/\* https:\/\/aaif\.io\/_next\/static\/chunks\/[^ ]+ \*\/\n/g, '');
writeFileSync(OUT + 'aaif.css', `/* Generated by scripts/import-aaif-chrome.mjs from aaif.io. Do not edit by hand. */\n${css}\n`);

console.log('Wrote', ['header.html', 'button-icon.html', 'panel-about.html', 'panel-resources.html', 'mobile-menu.html', 'footer.html', 'aaif.css'].map((f) => OUT + f).join(', '));
