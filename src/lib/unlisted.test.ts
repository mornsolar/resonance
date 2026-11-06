import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UNLISTED_PATHS, isListedInSitemap } from './unlisted';

describe('isListedInSitemap', () => {
  it('leaves the pilot privacy note out of the sitemap', () => {
    expect(isListedInSitemap('https://mornsolar.com/pilot/privacy/')).toBe(false);
  });

  it('leaves it out with or without the trailing slash', () => {
    expect(isListedInSitemap('https://mornsolar.com/pilot/privacy')).toBe(false);
  });

  it.each(['/', '/privacy/', '/check/', '/about/', '/stories/', '/reset/'])('keeps %s in the sitemap', (path) => {
    expect(isListedInSitemap(`https://mornsolar.com${path}`)).toBe(true);
  });

  it('does not hide a page whose address only starts with the same words', () => {
    expect(isListedInSitemap('https://mornsolar.com/pilot/privacy-extra/')).toBe(true);
  });

  it('works for any host, so previews follow the same rule', () => {
    expect(isListedInSitemap('https://mornsolar-git-x-mornsolar.vercel.app/pilot/privacy/')).toBe(false);
  });
});

describe('UNLISTED_PATHS', () => {
  it('lists plain paths with a leading and a trailing slash', () => {
    for (const path of UNLISTED_PATHS) {
      expect(path.startsWith('/')).toBe(true);
      expect(path.endsWith('/')).toBe(true);
    }
  });
});

// The helper above only decides; these tests protect the wiring that makes an unlisted page really unlisted.
// Each reads a source file as text, in the style of vercel-config.test.ts.
const root = new URL('../../', import.meta.url);
const read = (relative: string): string => readFileSync(new URL(relative, root), 'utf-8');

/** The page file for a public path: /pilot/privacy/ is src/pages/pilot/privacy.astro or .../privacy/index.astro. */
function pageSourceFor(path: string): string | undefined {
  const trimmed = path.replace(/^\/|\/$/g, '');
  const candidates = [`src/pages/${trimmed}.astro`, `src/pages/${trimmed}/index.astro`];
  const found = candidates.find((candidate) => existsSync(new URL(candidate, root)));
  return found ? read(found) : undefined;
}

/** The opening <Base ...> tag of a page, attributes included. */
function baseOpeningTag(source: string): string {
  return source.match(/<Base\b[^>]*>/)?.[0] ?? '';
}

describe('every unlisted path has a page that asks for noindex', () => {
  it.each(UNLISTED_PATHS)('%s exists as a page and passes noindex to Base', (path) => {
    const source = pageSourceFor(path);
    expect(source, `no page file found for ${path}`).toBeDefined();
    expect(baseOpeningTag(source ?? '')).toMatch(/\bnoindex\b/);
  });
});

describe('the layout and the config carry out the unlisted rule', () => {
  const base = read('src/layouts/Base.astro');
  const astroConfig = read('astro.config.mjs');

  it('Base writes a robots noindex tag when it is asked to', () => {
    expect(base).toMatch(/noindex\s*&&\s*<meta name="robots" content="noindex">/);
  });

  it('the sitemap integration is given the filter from src/lib/unlisted', () => {
    expect(astroConfig).toMatch(/import\s*\{\s*isListedInSitemap\s*\}\s*from\s*'\.\/src\/lib\/unlisted(\.ts)?'/);
    expect(astroConfig).toMatch(/sitemap\(\s*\{[^}]*filter:\s*isListedInSitemap/);
  });

  it.each(UNLISTED_PATHS)('%s is not in the header or footer links', (path) => {
    expect(base).not.toContain(path);
    expect(base).not.toContain(path.replace(/\/$/, ''));
  });
});
