import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The site is served from the root of mornsolar.vercel.app, so it needs no base path.
// If a custom domain is added later, change PRODUCTION_SITE to that domain.
const PRODUCTION_SITE = 'https://mornsolar.vercel.app';

// Canonical links, the social image URL and the sitemap are built from `site`.
// Vercel production and local builds use the public address; Vercel previews use their
// own deployment URL so link previews can be checked.
function resolveSite() {
  const isPreview = Boolean(process.env.VERCEL) && process.env.VERCEL_ENV !== 'production';
  return isPreview && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : PRODUCTION_SITE;
}

export default defineConfig({
  integrations: [sitemap()],
  site: resolveSite(),
  base: '/',
});
