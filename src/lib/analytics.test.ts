import { describe, expect, it } from 'vitest';
import { ANALYTICS_BEACON_URL, beaconAttribute, isValidToken, shouldLoadAnalytics } from './analytics';

const TOKEN = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';

describe('isValidToken', () => {
  it('accepts a normal site token', () => {
    expect(isValidToken(TOKEN)).toBe(true);
  });

  it.each(['', 'short', 'has space in it 0123456789', '"><script>alert(1)</script>', 'a'.repeat(65), `${TOKEN}'`])(
    'rejects %j',
    (token) => {
      expect(isValidToken(token)).toBe(false);
    },
  );
});

describe('shouldLoadAnalytics', () => {
  it('loads on the production address with a token', () => {
    expect(shouldLoadAnalytics('mornsolar.com', 'mornsolar.com', TOKEN)).toBe(true);
  });

  it('stays off until a token is set', () => {
    expect(shouldLoadAnalytics('mornsolar.com', 'mornsolar.com', '')).toBe(false);
  });

  it.each(['mornsolar.vercel.app', 'mornsolar-git-analytics-mornsolar.vercel.app', 'www.mornsolar.com', 'localhost'])(
    'stays off for %s, so previews and other addresses never report',
    (host) => {
      expect(shouldLoadAnalytics(host, 'mornsolar.com', TOKEN)).toBe(false);
    },
  );
});

describe('beaconAttribute', () => {
  it('is the JSON Cloudflare expects', () => {
    expect(JSON.parse(beaconAttribute(TOKEN))).toEqual({ token: TOKEN });
  });

  it('refuses a token that is not valid', () => {
    expect(() => beaconAttribute('"><script>')).toThrow('Not a valid Cloudflare analytics token');
  });
});

describe('beacon URL', () => {
  it('is Cloudflare over https', () => {
    expect(ANALYTICS_BEACON_URL).toBe('https://static.cloudflareinsights.com/beacon.min.js');
  });
});
