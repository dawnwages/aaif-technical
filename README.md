# AAIF Technical: Technical Notes and Skills Catalog

A self-service, git-tracked site where AAIF working groups publish technical notes, and where AAIF runs the Skills Catalog. It is styled as part of aaif.io (same header, navigation, footer, typeface and palette) so it can be served under aaif.io and added to its Resources menu.

Live prototype: https://dawnwages.github.io/aaif-technical/ (labeled as a prototype and hidden from search engines)

Proposals:
- [AAIF Technical Notes: self-service publishing for WG output](https://docs.google.com/document/d/1B0WZrOLmcQlJCH236vDUodfI6S6UlXSFhsf1_1LjKWA/edit)
- [AAIF Skills Catalog](https://docs.google.com/document/d/1Y9rf3D5I9V33C_0TgGuA8Jr-vVmEloriwqnSEFvjXRQ/edit)
- [Working group technical output: next steps](https://docs.google.com/document/d/1a8PFXXkhotuig3Yc7tZeN-2pnXCq13B1vYHe41xeBUY/edit) (the RFC this implements)

## Publish a technical note

1. Copy `templates/note.md` to `src/content/notes/<your-wg-slug>/<short-title>.md`.
2. Fill in the front matter and write the note in Markdown.
3. Open a pull request. The build checks the fields and creates a preview.
4. One chair of your working group approves (see `.github/CODEOWNERS`). AAIF staff check only the label and neutrality.
5. Merging publishes the note.

### Labels

| Label | When to use it |
|---|---|
| `working-draft` | Work in progress the group wants wider input on |
| `guidance` | Signed off by the group and peer reviewed by a chair from another working group |
| `reviewed` | A Recommendation that completed the full publication track (chair sign-off, chair peer review and vote, public comment, TC review). The build rejects `reviewed` on any other route. |

## Add a skill to the catalog

1. Copy `templates/skill.yaml` to `src/content/skills/<short-name>.yaml`.
2. Link to the skill's source and pin its version. AAIF links to the source and doesn't host copies.
3. New entries use `status: listed`. A working group sets `reviewed` or `wg-maintained` and names itself in `reviewedBy`.

## Run locally

```sh
npm install
npm run dev        # http://localhost:4321/technical/
npm run build      # static site in dist/
```

Requires Node 20 or later.

## Deploy

`.github/workflows/site.yml` builds every pull request and deploys `main` to GitHub Pages. By default it serves at `https://<owner>.github.io/<repo>/` for review.

To serve under aaif.io, set two repository variables:

| Variable | Example | Meaning |
|---|---|---|
| `SITE_URL` | `https://aaif.io` | The domain the site is served from |
| `BASE_PATH` | `/technical` | The path the site lives under |
| `PROTOTYPE` | `false` | Removes the prototype label and the noindex tag (also delete `public/robots.txt`) |

The output in `dist/` is plain static files, so LF IT can also host it behind aaif.io with a path rewrite (for example `aaif.io/technical/*`), or on a subdomain.

## Matching aaif.io

The header, navigation menus, mobile menu and footer are aaif.io's own markup, and the site uses aaif.io's compiled CSS, captured from the live site on November 20, 2026. Page bodies (heroes, cards, tag pills, buttons and article text) are built from the same classes aaif.io uses on its blog, so the change between aaif.io and this site is close to invisible.

- Technical Notes and Skills Catalog are added to the Resources menu and to the footer's Resources column. Add the same two links to aaif.io so both sites share one navigation.
- The menus open and close with a small script in `src/components/Header.astro`, standing in for aaif.io's React code. The mobile About and Resources items open a list of their links.
- To refresh after aaif.io changes its header or footer, see `aaif-capture/README.md`.
- `src/styles/site.css` holds the few styles aaif.io has no class for. Use aaif.io's classes everywhere else.

## Structure

```
src/
  content.config.ts        schemas for notes and skills (the PR checks)
  content/notes/<wg>/      one Markdown file per note
  content/skills/          one YAML file per skill
  aaif/                    aaif.io header, menus, footer and CSS (generated)
  data/working-groups.ts   working groups, note labels, skill review levels
  components/              Header, Footer, heroes, cards, pill, button
  layouts/Base.astro       page shell
  pages/                   home, notes, WG pages, skills, RSS
  styles/site.css          the few styles aaif.io has no class for
aaif-capture/              the raw aaif.io capture and the re-capture script
scripts/                   import-aaif-chrome.mjs
templates/                 note and skill templates for contributors
```

The example notes and skills (`example: true`) are placeholders. Remove them before launch.

## Drift check against aaif.io

`.github/workflows/aaif-drift.yml` runs every Monday and on demand (Actions > aaif.io style drift > Run workflow). It:

1. Builds the site and screenshots its header and footer next to the live aaif.io, at desktop (1440px) and mobile (390px) widths, ignoring the two links this site adds.
2. Re-captures aaif.io's header, menus, footer and CSS, and rebuilds.
3. If the screenshots differ by more than 3% of pixels in any region, or aaif.io's captured markup or CSS changed, it opens (or updates) a pull request on `aaif-sync/refresh` with the refreshed capture and a report, and opens (or comments on) an issue labeled `aaif-drift`. Screenshots and pixel diffs are attached to the run.
4. If the visual drift is significant, or aaif.io changed its header, menus or footer markup, the run fails so GitHub notifies the repo owner. A CSS-only change opens the pull request without failing.

Run it locally with `npm run build && npm run test:visual`, and refresh the capture with `npm run capture:aaif`.
