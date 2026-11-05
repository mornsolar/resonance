/**
 * Pages that exist for people who were given the link, and are not meant to be found through search.
 * Each one is served with a noindex tag (the `noindex` prop on Base.astro), is left out of the sitemap
 * (astro.config.mjs uses `isListedInSitemap`), and is not in the header or footer links.
 * Keep the paths here as plain paths with a leading and a trailing slash.
 */
export const UNLISTED_PATHS: readonly string[] = ['/pilot/privacy/'];

function withTrailingSlash(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/** True when the page belongs in sitemap.xml. Takes the full address the sitemap integration passes in. */
export function isListedInSitemap(pageUrl: string): boolean {
  const pathname = withTrailingSlash(new URL(pageUrl).pathname);
  return !UNLISTED_PATHS.includes(pathname);
}
