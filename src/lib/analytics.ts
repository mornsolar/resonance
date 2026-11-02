// Cloudflare Web Analytics: counts page views without cookies. The script is added only when the site is built
// for the production address and a token has been set, so local previews and Vercel preview links never report.

export const ANALYTICS_BEACON_URL = 'https://static.cloudflareinsights.com/beacon.min.js';

// A Cloudflare site token is a short run of letters and digits. Anything else could break out of the HTML attribute.
const TOKEN_PATTERN = /^[A-Za-z0-9]{16,64}$/;

export function isValidToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

export function shouldLoadAnalytics(siteHostname: string, productionHostname: string, token: string): boolean {
  return siteHostname === productionHostname && isValidToken(token);
}

/** The value for the script's data-cf-beacon attribute. */
export function beaconAttribute(token: string): string {
  if (!isValidToken(token)) throw new Error('Not a valid Cloudflare analytics token');
  return JSON.stringify({ token });
}
