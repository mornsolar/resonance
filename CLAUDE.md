# Understory website

Astro 7 static site for the founder's intentional-technology venture. Live at https://mornsolar.vercel.app/ (also served on GitHub Pages at https://mornsolar.github.io/resonance/; repo `mornsolar/resonance`). Use the Vercel address when sharing links. Every push to `main` builds and deploys through `.github/workflows/deploy.yml`.

## Commands

- `npm run dev`: local preview at http://localhost:4321/resonance/
- `npm run build`: production build into `dist/`; run before every push

## Adding a story

1. The source is the founder's vault: `~/business-brain/business-brain/Content & Storytelling/Stories/`.
2. Publish only stories whose vault **Status** allows public posting, or that the founder has explicitly approved.
3. Create `src/content/stories/<slug>.md` with front matter `title`, `date` (YYYY-MM-DD), `summary`, `reflection` (one open question for the reader). Use `draft: true` to keep a story off the site.
4. Copy the story text verbatim. Drop the vault wrapper (raw ingredients, transferable lesson, Theory of Change stage, assumption, status) and Obsidian embeds like `![[...]]`.
5. Privacy check before publishing: no names or images identifying interviewees or other people's children. Check images for handwritten names.

## The phone check-in (`/check/`)

A lead-generation assessment built on the Priestley 10+5 structure: landing page → 15 questions → scored result → Step 1 (two-minute exercise) → Step 2 (one-week reset sign-up or a chat).

- Questions, dimensions and all result copy live in `src/lib/checkin/` (`questions.ts`, `insights.ts`, `journey.ts`). Scoring and routing rules are in `scoring.ts`; the Formspree payload in `submission.ts`. Change copy there, not in the pages.
- Every rule is unit-tested (`npm test`, Vitest). CI runs the tests before deploying. Update the tests when you change a threshold.
- Journey state lives only in `sessionStorage` (`store.ts`). Nothing reaches Formspree unless a form is submitted; Step 2 sends the check-in summary only while its "include" box is ticked.
- Research claims in the copy come from the vault's Research & Trends notes. Never cite the "mere presence / brain drain" effect (it did not replicate) or call anything "brain rot".
- Band cut-offs (8 and 15) are pilot guesses. Revisit them once real results arrive.

## Rules

- No invented content. Copy comes from the vault or is approved by the founder; if something is missing, ask rather than write filler.
- Contact details, the Formspree endpoint and the booking link live only in `src/lib/config.ts`.
- Every internal link and asset path goes through `url()` from `src/lib/url.ts`. The site is served under `/resonance` on GitHub Pages but from the root on Vercel; `astro.config.mjs` picks the base path from the `VERCEL` environment variable.
- Changes go on a branch and a pull request, so Vercel can build a preview URL to check before merging to `main`.
- Colours come from the tokens at the top of `src/styles/global.css`, with a dark-mode override under `prefers-color-scheme: dark`. Use tokens (`var(--forest)`, `var(--paper-deep)`), never raw hex, so both themes stay in step.
- Fonts are self-hosted through `@fontsource-variable` (no Google Fonts requests). Motion is optional and must respect `prefers-reduced-motion`.
- `public/og.png` is the social preview image. If the tagline or brand colours change, regenerate it rather than leaving it stale.
- The brand was renamed from Resonance to Understory. The Understory design system (palette, type, mark) is the reference for look and voice. The mark is rings over a horizon with a half-disc sun: `src/components/Canopy.astro` (hero), the header mark in `Base.astro`, and `public/favicon.svg`. Metaphor for copy: the understory is the calm layer beneath the canopy where what matters gets enough light to grow. Do not reuse the old tuning-fork or "respond when struck" language.
- Brand rules come from the brand identity note in the vault's `Mission & Vision` folder (still filed as `Brand Identity - Resonance.md` until renamed): calm, trusted-friend voice; no pop-ups, streaks, countdowns or urgency tricks.
- The repo, GitHub Pages path (`/resonance` in `astro.config.mjs`) and live URL above still carry the old name until the repo is renamed; change them together.
- Commits use conventional format (`feat:`, `fix:`, `docs:` and so on).
