// Copy and helpers for promoting the one-week reset from other pages. The wording comes from the reset page itself
// ("free", "a handful of people"); the reply time is the founder's: a personal email within a day.

export const PLACEMENTS = ['home', 'story', 'try', 'step-1', 'about', 'speaking'] as const;
export type Placement = (typeof PLACEMENTS)[number];

export const PLACEMENT_PARAM = 'from';

/** The form's `source` value when a visitor arrives at the reset page without a known placement. */
export const DEFAULT_SOURCE = 'reset-page';

export const PROMO_COPY = {
  eyebrow: 'An honest experiment',
  heading: 'Run the one-week phone reset with me',
  body: "A week of saying what you'll use your phone for before you pick it up, then locking it away afterwards. Free, and small: a handful of people, so I can pay attention to each person's week.",
  register: 'Register your interest',
  book: 'Book a 15-minute chat →',
  reply: "Register and I'll email you back within a day.",
  inlineLink: 'Run the one-week reset with me',
} as const;

export function isPlacement(value: string): value is Placement {
  return (PLACEMENTS as readonly string[]).includes(value);
}

/** The placement from a URL query string such as "?from=home", or null when missing or not a known placement. */
export function parsePlacement(search: string): Placement | null {
  const value = new URLSearchParams(search).get(PLACEMENT_PARAM);
  return value !== null && isPlacement(value) ? value : null;
}

/** A link to the reset page's sign-up form that records which page the visitor came from. */
export function resetHref(resetPath: string, from: Placement): string {
  return `${resetPath}?${PLACEMENT_PARAM}=${from}#join`;
}

/** The value for the form's hidden `source` field. */
export function sourceFor(placement: Placement | null): string {
  return placement ? `${DEFAULT_SOURCE}-from-${placement}` : DEFAULT_SOURCE;
}
