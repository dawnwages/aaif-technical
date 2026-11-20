# AAIF Technical: Technical Notes and Skills Catalog

A self-service, git-tracked site where AAIF working groups publish technical notes, and where AAIF runs the Skills Catalog. It is styled as part of aaif.io (same header, navigation, footer, typeface and palette) so it can be served under aaif.io and added to its Resources menu.

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

The output in `dist/` is plain static files, so LF IT can also host it behind aaif.io with a path rewrite (for example `aaif.io/technical/*`), or on a subdomain.

## Matching aaif.io

| What | Where | Status |
|---|---|---|
| Navigation, footer links, legal text | `src/data/site.ts` | Copied from aaif.io, November 2026 |
| Colors, type scale, spacing | `src/styles/tokens.css` | From aaif.io/brand (black, white, coral #FF702D, lilac #B6B0D0) |
| Typeface | `src/layouts/Base.astro` | Instrument Sans from Google Fonts |
| Header and footer markup | `src/components/Header.astro`, `Footer.astro` | Built to match; not yet compared against the live CSS |

aaif.io runs on Next.js with Sanity. For a seamless match, ask the aaif.io maintainers for either:
- their header and footer React components: add `@astrojs/react`, then render them in `Base.astro` in place of `Header.astro` and `Footer.astro`; or
- the compiled CSS values for the header, footer and body: update `tokens.css`.

When the site goes live, add Technical Notes (`/technical/notes/`) and Skills Catalog (`/technical/skills/`) to the Resources menu on aaif.io, so both sites share one navigation.

## Structure

```
src/
  content.config.ts        schemas for notes and skills (the PR checks)
  content/notes/<wg>/      one Markdown file per note
  content/skills/          one YAML file per skill
  data/site.ts             aaif.io navigation and footer
  data/working-groups.ts   working groups, note labels, skill review levels
  components/              Header, Footer, cards
  layouts/Base.astro       page shell
  pages/                   home, notes, WG pages, skills, RSS
  styles/                  tokens and global styles
templates/                 note and skill templates for contributors
```

The example notes and skills (`example: true`) are placeholders. Remove them before launch.
