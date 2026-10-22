# Resonance website

Astro 7 static site for the founder's intentional-technology venture. Live at https://mornsolar.github.io/resonance/ (repo `mornsolar/resonance`). Every push to `main` builds and deploys through `.github/workflows/deploy.yml`.

## Commands

- `npm run dev`: local preview at http://localhost:4321/resonance/
- `npm run build`: production build into `dist/`; run before every push

## Adding a story

1. The source is the founder's vault: `~/business-brain/business-brain/Content & Storytelling/Stories/`.
2. Publish only stories whose vault **Status** allows public posting, or that the founder has explicitly approved.
3. Create `src/content/stories/<slug>.md` with front matter `title`, `date` (YYYY-MM-DD), `summary`, `reflection` (one open question for the reader). Use `draft: true` to keep a story off the site.
4. Copy the story text verbatim. Drop the vault wrapper (raw ingredients, transferable lesson, Theory of Change stage, assumption, status) and Obsidian embeds like `![[...]]`.
5. Privacy check before publishing: no names or images identifying interviewees or other people's children. Check images for handwritten names.

## Rules

- No invented content. Copy comes from the vault or is approved by the founder; if something is missing, ask rather than write filler.
- Contact details, the Formspree endpoint and the booking link live only in `src/lib/config.ts`.
- Every internal link and asset path goes through `url()` from `src/lib/url.ts`. The site is served under `/resonance` on GitHub Pages but from the root on Vercel; `astro.config.mjs` picks the base path from the `VERCEL` environment variable.
- Changes go on a branch and a pull request, so Vercel can build a preview URL to check before merging to `main`.
- Brand rules come from `Mission & Vision/Brand Identity - Resonance.md` in the vault: calm, trusted-friend voice; no pop-ups, streaks, countdowns or urgency tricks.
- Commits use conventional format (`feat:`, `fix:`, `docs:` and so on).
