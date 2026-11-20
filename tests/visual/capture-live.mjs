// Captures the live aaif.io header, menus, mobile menu, footer and CSS with
// Playwright and writes them to aaif-capture/raw/. Same capture as
// aaif-capture/capture.js, but headless, for CI.
//
//   node tests/visual/capture-live.mjs
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { hideOverlays } from './overlays.mjs';

const URL = process.env.AAIF_URL ?? 'https://aaif.io/blog';
const RAW = 'aaif-capture/raw/';
mkdirSync(RAW, { recursive: true });

const browser = await chromium.launch();
try {
  const desk = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desk.goto(URL, { waitUntil: 'networkidle' });
  await hideOverlays(desk);

  const out = await desk.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const o = {};
    o['wrap.html'] = document.querySelector('body > div.fixed.top-0').outerHTML;
    for (const btn of document.querySelectorAll('header nav button[aria-haspopup]')) {
      btn.click();
      await sleep(900);
      const panel = [...document.querySelectorAll('header [data-nav-dropdown="true"]')].find((e) => e.tagName !== 'NAV');
      const name = btn.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
      o[`panel-${name}.html`] = panel ? panel.outerHTML : '';
      btn.click();
      await sleep(500);
    }
    o['footer.html'] = document.querySelector('footer').outerHTML;
    const hrefs = [...document.styleSheets].map((s) => s.href).filter((h) => h && h.includes('/_next/static'));
    const css = await Promise.all(hrefs.map((h) => fetch(h).then((r) => r.text())));
    o['aaif-full.css'] = hrefs.map((h, i) => `/* ${h} */\n${css[i]}`).join('\n');
    return o;
  });

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mob.goto(URL, { waitUntil: 'networkidle' });
  await hideOverlays(mob);
  await mob.click('header button[aria-label="Open menu"]');
  await mob.waitForTimeout(900);
  out['mobile.html'] = await mob.evaluate(() => document.querySelector('body > div.fixed.top-0').outerHTML);

  for (const [name, content] of Object.entries(out)) {
    if (!content) throw new Error(`Capture of ${name} came back empty; aaif.io's markup may have changed shape.`);
    writeFileSync(RAW + name, content);
  }
  console.log('Captured', Object.keys(out).join(', '), 'from', URL);
} finally {
  await browser.close();
}
