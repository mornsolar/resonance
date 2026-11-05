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
