/**
 * Campaign tags: a short label such as "youtube-description", carried in a link as `?src=...`.
 * The tag is kept for the browser tab only (sessionStorage) and sent with any form as a `campaign` field,
 * so a sign-up can be traced to the link that brought the visitor. The site has no analytics; this is the
 * only attribution there is, and nothing else about the visit is stored.
 */
export const CAMPAIGN_PARAM = 'src';
export const CAMPAIGN_FIELD = 'campaign';
export const CAMPAIGN_STORAGE_KEY = 'understory-campaign';

const TAG_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;

export interface CampaignStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** The tag from a URL query string, lower-cased, or null when it is missing or not a safe tag. */
export function parseCampaign(search: string): string | null {
  const value = new URLSearchParams(search).get(CAMPAIGN_PARAM);
  if (value === null) return null;
  const tag = value.trim().toLowerCase();
  return TAG_PATTERN.test(tag) ? tag : null;
}

/** The stored tag, or null when there is none, it is not a safe tag, or storage is unavailable. */
export function currentCampaign(storage: CampaignStorage | null): string | null {
  if (!storage) return null;
  try {
    const stored = storage.getItem(CAMPAIGN_STORAGE_KEY);
    return stored !== null && TAG_PATTERN.test(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Stores a valid tag from the URL (a newer tag replaces an older one) and returns the tag now in force. */
export function captureCampaign(search: string, storage: CampaignStorage | null): string | null {
  const fromUrl = parseCampaign(search);
  if (fromUrl && storage) {
    try {
      storage.setItem(CAMPAIGN_STORAGE_KEY, fromUrl);
    } catch {
      // Storage is blocked (for example private mode): the tag still applies on this page.
    }
  }
  return fromUrl ?? currentCampaign(storage);
}

/** A copy of the fields with the tag added, unless there is no tag or the fields already carry one. */
export function withCampaign(
  fields: Readonly<Record<string, string>>,
  campaign: string | null,
): Record<string, string> {
  return campaign && !(CAMPAIGN_FIELD in fields) ? { ...fields, [CAMPAIGN_FIELD]: campaign } : { ...fields };
}

/** The tab's sessionStorage, or null when the browser does not allow access to it. */
export function browserStorage(): CampaignStorage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}
