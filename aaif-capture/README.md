# aaif.io capture

The site's header, navigation menus, mobile menu, footer and CSS are copied from the live aaif.io, so the subsite looks and behaves like aaif.io. This folder holds that copy and the tools to refresh it.

| File | What it is |
|---|---|
| `raw/wrap.html` | The fixed top bar: Linux Foundation strip and header, menus closed |
| `raw/panel-aboutaaif.html`, `raw/panel-resources.html` | The About AAIF and Resources dropdowns, open |
| `raw/mobile.html` | The header with the mobile menu open |
| `raw/footer.html` | The footer |
| `raw/aaif-full.css` | aaif.io's compiled stylesheets, in their original order |
| `capture.js` | Paste into the browser console on aaif.io to capture all of the above |

`scripts/import-aaif-chrome.mjs` turns these into `src/aaif/`, which the site renders. It makes links absolute to aaif.io, adds Technical Notes and Skills Catalog to the Resources menu and the footer's Resources column, and swaps aaif.io's font files for the same Instrument Sans from Google Fonts.

## Refresh after aaif.io changes

1. Open https://aaif.io/blog in Chrome at desktop width.
2. Paste `capture.js` into DevTools > Console and press Enter. It downloads `aaif-capture.json`.
3. Move `aaif-capture.json` into this folder and run `node scripts/import-aaif-chrome.mjs`.
4. Review the diff and open a pull request.

Captured November 20, 2026.

## Better long term

aaif.io runs on Next.js and Sanity. Once Technical Notes and Skills Catalog are in the aaif.io Resources menu, the cleanest setup is for aaif.io to publish its header and footer as a shared component or an HTML fragment that this site fetches at build time. Then a menu change on aaif.io reaches the subsite on its next build with no capture step.
