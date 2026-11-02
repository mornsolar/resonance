# Understory website

Astro 7 static site for the founder's intentional-technology venture. Live at https://mornsolar.com/ (repo `mornsolar/resonance`). Always share and link the `mornsolar.com` address; never use `mornsolar.github.io`. The older `mornsolar.vercel.app` address only redirects to `mornsolar.com` (`vercel.json`, path and `?src=` tag kept); it is printed on QR codes and in posts made before the switch, so keep that redirect working until those are replaced. Vercel deploys `main` on its own. The GitHub Pages deploy was switched off in November 2026; `.github/workflows/ci.yml` now only runs the tests and the build on pushes and pull requests.

## Commands

- `npm run dev`: local preview at http://localhost:4321/
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
- Every rule is unit-tested (`npm test`, Vitest). CI runs them (with the build) on every push and pull request, but it does not gate the Vercel deploy, so run `npm test` before you push. Update the tests when you change a threshold.
- Journey state lives only in `sessionStorage` (`store.ts`). Nothing reaches Formspree unless a form is submitted; Step 2 sends the check-in summary only while its "include" box is ticked.
- Research claims in the copy come from the vault's Research & Trends notes. Never cite the "mere presence / brain drain" effect (it did not replicate) or call anything "brain rot".
- Band cut-offs (8 and 15) are pilot guesses. Revisit them once real results arrive.

## Campaign tags

Links we share carry a short tag, `?src=<tag>` (lower-case letters, digits and hyphens, up to 40 characters). `src/lib/campaign.ts` keeps the tag for the browser tab in `sessionStorage` and adds it as a `campaign` field to every Formspree submission: the ordinary forms (`src/scripts/forms.ts`) and the check-in (`src/scripts/checkin-send.ts`). Page-level visit counts come from Cloudflare Web Analytics (see Analytics below), but only these tags connect a sign-up to the link it came from. Tags in use: `youtube-description`, `youtube-comment`, `youtube-endcard`, `facebook-post`, `linkedin-post`, `companion-page` (the check-in button on the video page), `spot-checklist` (the checklist page button and the QR code on its PDF). Add new tags freely, keep them descriptive, and list them here. The privacy page names this.

## Video pages (`/videos/`)

`src/pages/videos/intermittent-rewards.astro` is the companion page for the first YouTube video (id `TxRZGMaj0Hs`). Copy, chapters, sources and transcript live in `src/lib/videos/`; the timestamp and YouTube address helpers are in `src/lib/video.ts`. The player (`src/components/VideoPlayer.astro`) is a click-to-play facade: nothing is requested from YouTube or Google until the visitor presses play, then it plays from `youtube-nocookie.com`. The page is deliberately not linked from the nav, the video or the posts until after experiment EXP-012 closes (15 November 2026), so the funnel stays unchanged during the measurement window. The transcript is cleaned from automatic captions and nine lines were never checked against the audio.

`src/pages/spot-the-slot-machine.astro` is the "Spot the slot machine" checklist (copy in `src/lib/checklists/`). It is unlinked for the same reason. `public/downloads/spot-the-slot-machine.pdf` is rendered from the page's own print layout with headless Chromium (`page.pdf`, A4, print media, nothing ticked); re-render it whenever the copy changes, and check it is still one page. The QR code in `public/downloads/spot-checklist-qr.svg` points to `https://mornsolar.com/check/?src=spot-checklist`; decode it after regenerating.

## Promoting the one-week reset

`src/components/ResetPromo.astro` invites people to the reset from other pages: a full card (home page, and the phone-lock story) or one inline sentence (other stories, check-in step 1, speaking). Wording and helpers live in `src/lib/reset-promo.ts` (tested); keep claims to what the reset page already says (free, a handful of people, a personal reply within a day). No urgency, scarcity or countdowns. Each link carries `?from=<placement>` (`home`, `story`, `try`, `step-1`, `about`, `speaking`), and `src/scripts/reset-source.ts` writes it into the form's hidden `source` field (`reset-page-from-home` and so on), so the Formspree inbox shows which placement brought each sign-up. This is separate from the `?src=` campaign tags and never overwrites them. The 15-minute booking link goes to Google Calendar and cannot be tagged. Add a placement by extending `PLACEMENTS`.

## Analytics

Cloudflare Web Analytics, free and cookieless, counts page views. `src/components/Analytics.astro` (in `Base.astro`) adds Cloudflare's beacon only when the site is built for `PRODUCTION_HOSTNAME` (`mornsolar.com`) and `CLOUDFLARE_ANALYTICS_TOKEN` in `src/lib/config.ts` is set, so local builds, Vercel previews and other addresses never report; `src/lib/analytics.ts` holds that rule and is tested. The token is public (it is visible in the page source), not a secret. The privacy page, "Counting visits", says what is collected and must stay accurate: it relies on Cloudflare's own statement that the beacon uses no cookies or localStorage and does not fingerprint individuals. If the analytics provider changes, update that section in the same change. The data lives in the founder's Cloudflare account (Analytics & Logs, Web Analytics), and the same beacon works unchanged when hosting moves to Cloudflare.

## Rules

- No invented content. Copy comes from the vault or is approved by the founder; if something is missing, ask rather than write filler.
- Contact details, the Formspree endpoint and the booking link live only in `src/lib/config.ts`.
- Every internal link and asset path goes through `url()` from `src/lib/url.ts`. The site is served from the root (base `/`), so `url()` returns plain paths today; keep using it so a base path can be added later without touching every link.
- Changes go on a branch and a pull request, so Vercel can build a preview URL to check before merging to `main`.
- Colours come from the tokens at the top of `src/styles/global.css`, with a dark-mode override under `prefers-color-scheme: dark`. Use tokens (`var(--forest)`, `var(--paper-deep)`), never raw hex, so both themes stay in step.
- Fonts are self-hosted through `@fontsource-variable` (no Google Fonts requests). Motion is optional and must respect `prefers-reduced-motion`.
- `public/og.png` is the social preview image. If the tagline or brand colours change, regenerate it rather than leaving it stale.
- The brand was renamed from Resonance to Understory. The Understory design system (palette, type, mark) is the reference for look and voice. The mark is rings over a horizon with a half-disc sun: `src/components/Canopy.astro` (hero), the header mark in `Base.astro`, and `public/favicon.svg`. Metaphor for copy: the understory is the calm layer beneath the canopy where what matters gets enough light to grow. Do not reuse the old tuning-fork or "respond when struck" language.
- Brand rules come from the brand identity note in the vault's `Mission & Vision` folder (`Brand Identity - Understory.md`): calm, trusted-friend voice; no pop-ups, streaks, countdowns or urgency tricks.
- The GitHub repo and the local folder and package name (`mornsolar/resonance`, `resonance-site`) still carry the old name until the repo is renamed. Renaming the repo is a separate decision for the founder.
- Commits use conventional format (`feat:`, `fix:`, `docs:` and so on).
