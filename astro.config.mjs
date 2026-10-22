import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages serves the site under /resonance/. Vercel serves it from the root
// of each deployment URL, so it needs no base path. If a custom domain is added
// later, change `site` to that domain and `base` to '/' for both hosts.
const onVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  integrations: [sitemap()],
  site: onVercel && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://mornsolar.github.io',
  base: onVercel ? '/' : '/resonance',
});
