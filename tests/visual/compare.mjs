// Compares the subsite's header and footer with the live aaif.io, pixel by
// pixel, at desktop and mobile widths. Writes a Markdown report and diff images
// to tests/visual/out/, and exits non-zero when drift passes the threshold.
//
//   npm run build && node tests/visual/compare.mjs [label]
//
// Env: AAIF_URL (default https://aaif.io/blog), DRIFT_THRESHOLD (default 0.03,
// the share of differing pixels in any region that counts as significant).
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { hideOverlays } from './overlays.mjs';

const label = process.argv[2] ?? 'check';
const AAIF_URL = process.env.AAIF_URL ?? 'https://aaif.io/blog';
const THRESHOLD = Number(process.env.DRIFT_THRESHOLD ?? 0.03);
const BASE = (process.env.BASE_PATH ?? '/technical').replace(/\/$/, '');
const OUT = 'tests/visual/out';
const SIZE_TOLERANCE = Number(process.env.SIZE_TOLERANCE ?? 2);

function crop(png, w, h) {
  if (png.width === w && png.height === h) return png;
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, 0, 0, w, h, 0, 0);
  return out;
}
mkdirSync(OUT, { recursive: true });

// Serve dist/ under BASE, the way it will be served on aaif.io.
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  p = join('dist', p.slice(BASE.length));
  try {
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const OURS = `http://localhost:${port}${BASE}/notes/`;

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
const regions = [
  { name: 'header', selector: 'body > div.fixed.top-0' },
  { name: 'footer', selector: 'footer' },
];

async function shoot(browser, url, vp, region) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await hideOverlays(page);
  // Compare the chrome only: hide page bodies and the links this site adds.
  await page.addStyleTag({ content: 'main { visibility: hidden !important; } [data-aaif-added] { display: none !important; }' });
  await page.evaluate(() => document.querySelectorAll('[data-aaif-added]').forEach((a) => (a.closest('li') ?? a).remove()));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const el = page.locator(region.selector).first();
  const buf = await el.screenshot();
  await page.close();
  return PNG.sync.read(buf);
}

const browser = await chromium.launch();
const rows = [];
let significant = false;
try {
  for (const vp of viewports) {
    for (const region of regions) {
      const a = await shoot(browser, AAIF_URL, vp, region);
      const b = await shoot(browser, OURS, vp, region);
      const id = `${label}-${vp.name}-${region.name}`;
      writeFileSync(`${OUT}/${id}-aaif.png`, PNG.sync.write(a));
      writeFileSync(`${OUT}/${id}-ours.png`, PNG.sync.write(b));
      // A pixel or two of height comes from font rounding; more than that is a real layout change.
      const dw = Math.abs(a.width - b.width), dh = Math.abs(a.height - b.height);
      if (dw > SIZE_TOLERANCE || dh > SIZE_TOLERANCE) {
        rows.push({ vp: vp.name, region: region.name, ratio: 1, note: `size differs: aaif.io ${a.width}x${a.height}, ours ${b.width}x${b.height}` });
        significant = true;
        continue;
      }
      const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
      const ca = crop(a, w, h), cb = crop(b, w, h);
      const diff = new PNG({ width: w, height: h });
      const n = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.1 });
      writeFileSync(`${OUT}/${id}-diff.png`, PNG.sync.write(diff));
      const ratio = n / (w * h);
      if (ratio > THRESHOLD) significant = true;
      const sizeNote = dw || dh ? ` (sizes differ by ${dw}x${dh}px, compared the overlap)` : '';
      rows.push({ vp: vp.name, region: region.name, ratio, note: `${n} of ${w * h} pixels${sizeNote}` });
    }
  }
} finally {
  await browser.close();
  server.close();
}

const pct = (r) => `${(r * 100).toFixed(2)}%`;
const report = [
  `### Visual comparison (${label})`,
  '',
  `aaif.io: ${AAIF_URL} · threshold: ${pct(THRESHOLD)} of pixels per region`,
  '',
  '| Viewport | Region | Differing pixels | Status | Detail |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.vp} | ${r.region} | ${pct(r.ratio)} | ${r.ratio > THRESHOLD ? 'Drift' : 'OK'} | ${r.note} |`),
  '',
].join('\n');
writeFileSync(`${OUT}/${label}-report.md`, report);
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `significant=${significant}\n`);
process.exitCode = significant && process.env.NO_FAIL !== '1' ? 1 : 0;
