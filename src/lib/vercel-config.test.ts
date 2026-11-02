import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The old mornsolar.vercel.app address is printed on QR codes and sits in a video description and posts.
// This redirect keeps every one of those links working, with its path and ?src= tag, until the move to Cloudflare.
const root = new URL('../../', import.meta.url);
const vercelJson = JSON.parse(readFileSync(new URL('vercel.json', root), 'utf-8'));
const astroConfig = readFileSync(new URL('astro.config.mjs', root), 'utf-8');

interface Redirect {
  source: string;
  has: { type: string; value: string }[];
  destination: string;
  permanent: boolean;
}

describe('vercel.json redirect from the old address', () => {
  const [redirect] = vercelJson.redirects as Redirect[];

  it('has exactly one redirect', () => {
    expect(vercelJson.redirects).toHaveLength(1);
  });

  it('applies only when the request is for mornsolar.vercel.app', () => {
    const host = redirect.has.find((condition) => condition.type === 'host');
    expect(host).toBeDefined();
    const pattern = new RegExp(host?.value ?? '');
    expect(pattern.test('mornsolar.vercel.app')).toBe(true);
    expect(pattern.test('mornsolar.com')).toBe(false);
    expect(pattern.test('www.mornsolar.com')).toBe(false);
  });

  it('keeps the whole path, so deep links and the query string carry over', () => {
    expect(redirect.source).toBe('/:path*');
    expect(redirect.destination).toBe('https://mornsolar.com/:path*');
  });

  it('is permanent', () => {
    expect(redirect.permanent).toBe(true);
  });

  it('can never redirect to itself', () => {
    expect(new URL(redirect.destination.replace(':path*', '')).hostname).not.toMatch(/vercel\.app$/);
  });
});

describe('the site address', () => {
  it('uses the same domain the redirect points to', () => {
    const match = astroConfig.match(/PRODUCTION_SITE\s*=\s*'([^']+)'/);
    expect(match?.[1]).toBe('https://mornsolar.com');
  });
});
