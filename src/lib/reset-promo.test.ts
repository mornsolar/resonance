import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SOURCE,
  PLACEMENTS,
  PROMO_COPY,
  isPlacement,
  parsePlacement,
  resetHref,
  sourceFor,
} from './reset-promo';

describe('parsePlacement', () => {
  it.each(PLACEMENTS)('accepts the known placement %s', (placement) => {
    expect(parsePlacement(`?from=${placement}`)).toBe(placement);
  });

  it.each(['', '?', '?from=', '?from=unknown', '?from=HOME', '?from=<script>', '?src=home', '?from=home%20x'])(
    'ignores %j',
    (search) => {
      expect(parsePlacement(search)).toBeNull();
    },
  );

  it('reads the placement alongside other parameters', () => {
    expect(parsePlacement('?src=youtube-endcard&from=story')).toBe('story');
  });
});

describe('isPlacement', () => {
  it('rejects anything outside the fixed list', () => {
    expect(isPlacement('home')).toBe(true);
    expect(isPlacement('constructor')).toBe(false);
    expect(isPlacement('__proto__')).toBe(false);
  });
});

describe('resetHref', () => {
  it('links to the form on the reset page and records the placement', () => {
    expect(resetHref('/reset/', 'home')).toBe('/reset/?from=home#join');
  });

  it('round-trips with parsePlacement', () => {
    for (const placement of PLACEMENTS) {
      const query = resetHref('/reset/', placement).split('#')[0].split('?')[1];
      expect(parsePlacement(`?${query}`)).toBe(placement);
    }
  });
});

describe('sourceFor', () => {
  it('marks where a sign-up came from', () => {
    expect(sourceFor('story')).toBe('reset-page-from-story');
  });

  it('falls back to the plain reset page source', () => {
    expect(sourceFor(null)).toBe(DEFAULT_SOURCE);
  });
});

describe('promo copy', () => {
  const allCopy = Object.values(PROMO_COPY).join('\n');

  it('uses no em dashes and no exclamation marks', () => {
    expect(allCopy).not.toContain('—');
    expect(allCopy).not.toContain('!');
  });

  it('uses none of the urgency or scarcity tricks the brand rules rule out', () => {
    expect(allCopy).not.toMatch(/limited|hurry|last chance|only \d|spots? left|don't miss|act now|today only/i);
  });

  it('never uses the old brand name', () => {
    expect(allCopy).not.toMatch(/resonance/i);
  });

  it('keeps to what the reset page already says: free, and a handful of people', () => {
    expect(PROMO_COPY.body).toMatch(/free/i);
    expect(PROMO_COPY.body).toMatch(/handful of people/i);
  });
});
