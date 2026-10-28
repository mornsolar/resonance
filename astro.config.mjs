import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages serves the site under /resonance/. Vercel serves it from the root
// of each deployment URL, so it needs no base path. If a custom domain is added
// later, change `site` to that domain and `base` to '/' for both hosts.
const onVercel = Boolean(process.env.VERCEL);
const PRODUCTION_SITE = 'https://mornsolar.vercel.app';
const GITHUB_PAGES_SITE = 'https://mornsolar.github.io';

// Canonical links, the social image URL and the sitemap are built from `site`.
// Vercel production uses the public address; Vercel previews use their own
// deployment URL so link previews can be checked; GitHub Pages keeps its own.
function resolveSite() {
  if (!onVercel) return GITHUB_PAGES_SITE;
  if (process.env.VERCEL_ENV === 'production') return PRODUCTION_SITE;
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : PRODUCTION_SITE;
}

export default defineConfig({
  integrations: [sitemap()],
  site: resolveSite(),
  base: onVercel ? '/' : '/resonance',
});
