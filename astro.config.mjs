import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The site is served from the root of mornsolar.com, so it needs no base path. The old mornsolar.vercel.app
// address redirects here (see vercel.json) so printed QR codes and shared links keep working.
// When hosting moves to Cloudflare, only where mornsolar.com points changes; this address stays.
const PRODUCTION_SITE = 'https://mornsolar.com';

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
