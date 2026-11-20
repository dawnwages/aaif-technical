// Re-capture the aaif.io header, menus, footer and CSS.
//
// 1. Open https://aaif.io/blog in Chrome at a desktop width (1280px or wider).
// 2. Open DevTools > Console, paste this whole file, and press Enter.
// 3. It downloads aaif-capture.json. Move it into this folder (aaif-capture/).
// 4. Run: node scripts/import-aaif-chrome.mjs
//
// The script opens and closes the menus itself. It reads the page only.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const bar = document.querySelector('body > div.fixed.top-0');
  const out = { capturedFrom: location.href, capturedAt: new Date().toISOString() };
  out['wrap.html'] = bar.outerHTML;

  for (const btn of document.querySelectorAll('header nav button[aria-haspopup]')) {
    btn.click();
    await sleep(900);
    const panel = [...document.querySelectorAll('header [data-nav-dropdown="true"]')].find((e) => e.tagName !== 'NAV');
    const name = btn.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    out[`panel-${name}.html`] = panel ? panel.outerHTML : '';
    btn.click();
    await sleep(500);
  }

  // The mobile menu only renders below the lg breakpoint, so it is read from a
  // narrow iframe of the same page.
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;left:-9999px;width:390px;height:844px;border:0';
  frame.src = location.href;
  document.body.appendChild(frame);
  await new Promise((r) => (frame.onload = r));
  await sleep(2000);
  const fd = frame.contentDocument;
  fd.querySelector('header button[aria-label="Open menu"]').click();
  await sleep(900);
  out['mobile.html'] = fd.querySelector('body > div.fixed.top-0').outerHTML;
  frame.remove();

  out['footer.html'] = document.querySelector('footer').outerHTML;

  const hrefs = [...document.styleSheets].map((s) => s.href).filter((h) => h && h.includes('/_next/static'));
  const css = await Promise.all(hrefs.map((h) => fetch(h).then((r) => r.text())));
  out['aaif-full.css'] = hrefs.map((h, i) => `/* ${h} */\n${css[i]}`).join('\n');

  const blob = new Blob([JSON.stringify(out)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'aaif-capture.json' });
  a.click();
  console.log('Captured', Object.keys(out));
})();
