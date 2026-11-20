# AAIF Technical: Technical Notes and Skills Catalog

[![Build and deploy](https://github.com/dawnwages/aaif-technical/actions/workflows/site.yml/badge.svg)](https://github.com/dawnwages/aaif-technical/actions/workflows/site.yml)
[![aaif.io style drift](https://github.com/dawnwages/aaif-technical/actions/workflows/aaif-drift.yml/badge.svg)](https://github.com/dawnwages/aaif-technical/actions/workflows/aaif-drift.yml)

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

## GitHub Actions

| Workflow | When it runs | What it does |
|---|---|---|
| [Build and deploy](.github/workflows/site.yml) | Every pull request and every push to `main` | Builds the site. The build fails if a note or skill breaks the content rules. On `main` it deploys to GitHub Pages. |
| [aaif.io style drift](.github/workflows/aaif-drift.yml) | Mondays at 13:17 UTC, on demand, and on pushes that change the check itself | Compares this site's header and footer with the live aaif.io and raises an alarm when they drift apart. |

Both run on GitHub's standard hosted runner (`ubuntu-latest`). For a public repository that's free; a private repository would use the account's Actions minutes.

### Drift check against aaif.io

Each run:

1. Builds the site and takes screenshots of its header and footer next to the live aaif.io (`https://aaif.io/blog`), at desktop (1440px) and mobile (390px) widths. Page bodies, cookie banners, chat widgets, animations and the two links this site adds are hidden first, so only the shared header and footer are compared.
2. Compares each region pixel by pixel. More than 3% of pixels differing in any region counts as drift. A difference in size of 2px or less is font rounding and is ignored; anything larger counts as drift.
3. Re-captures aaif.io's header, menus, mobile menu, footer and CSS with Playwright, runs `scripts/import-aaif-chrome.mjs`, and checks whether `src/aaif/` changed. The import strips things that change on every page load (React ids, animation frames, HubSpot tracking parameters) so only real changes show up.
4. If anything changed, rebuilds and compares again, so the report shows before and after the refresh.

What it does when it finds something:

| Finding | Pull request on `aaif-sync/refresh` | Issue labeled `aaif-drift` | Run fails (GitHub emails the owner) |
|---|---|---|---|
| Visual drift over the threshold | Yes, if the refreshed capture differs | Yes (new issue, or a comment on the open one) | Yes |
| aaif.io changed its header, menu or footer markup | Yes | Yes | Yes |
| aaif.io changed only its CSS | Yes | No | No |
| Nothing changed | No | No | No |

Every run uploads the screenshots, pixel diffs and report as an artifact (`aaif-drift-<run id>`), and writes the report to the run summary.

Run it by hand from Actions > aaif.io style drift > Run workflow. The `threshold` input changes the drift threshold for that run (for example `0.005` to test the alarm). Locally:

```sh
npm install && npx playwright install chromium
npm run build && npm run test:visual   # compare with aaif.io; report in tests/visual/out/
npm run capture:aaif                   # re-capture aaif.io and regenerate src/aaif/
```

Repository settings it relies on: Settings > Actions > General > "Allow GitHub Actions to create and approve pull requests" must be on for the pull request step. Issues and the failure alert work without it.

Baseline on November 20, 2026, at the 3% threshold: desktop header 0.96%, desktop footer 1.03%, mobile header 0.00%, mobile footer 2.33% of pixels differ, all from font smoothing. A real change on aaif.io, such as a new menu item or a different footer, shows up well above that.

## Matching aaif.io

The header, navigation menus, mobile menu and footer are aaif.io's own markup, and the site uses aaif.io's compiled CSS, captured from the live site on November 20, 2026. Page bodies (heroes, cards, tag pills, buttons and article text) are built from the same classes aaif.io uses on its blog, so the change between aaif.io and this site is close to invisible.

- Technical Notes and Skills Catalog are added to the Resources menu and to the footer's Resources column. Add the same two links to aaif.io so both sites share one navigation.
- The menus open and close with a small script in `src/components/Header.astro`, standing in for aaif.io's React code. The mobile About and Resources items open a list of their links.
- The drift check (above) watches for changes on aaif.io and opens a refresh pull request. To refresh by hand, see `aaif-capture/README.md` or run `npm run capture:aaif`.
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
tests/visual/              drift check: capture-live.mjs, compare.mjs, overlays.mjs
.github/workflows/         site.yml (build and deploy), aaif-drift.yml (drift check)
templates/                 note and skill templates for contributors
```

The example notes and skills (`example: true`) are placeholders. Remove them before launch.
