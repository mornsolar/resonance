import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_STORAGE_KEY,
  captureCampaign,
  currentCampaign,
  parseCampaign,
  withCampaign,
  type CampaignStorage,
} from './campaign';

const memoryStorage = (initial: Record<string, string> = {}): CampaignStorage & { data: Record<string, string> } => {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
};

const blockedStorage: CampaignStorage = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
};

describe('parseCampaign', () => {
  it('returns the tag from a query string', () => {
    expect(parseCampaign('?src=youtube-endcard')).toBe('youtube-endcard');
  });

  it('accepts a query string without the leading question mark', () => {
    expect(parseCampaign('src=linkedin-post')).toBe('linkedin-post');
  });

  it('trims and lower-cases the tag', () => {
    expect(parseCampaign('?src=%20YouTube-Comment%20')).toBe('youtube-comment');
  });

  it('accepts digits and a tag of exactly 40 characters', () => {
    expect(parseCampaign('?src=launch-2026')).toBe('launch-2026');
    expect(parseCampaign(`?src=a${'b'.repeat(39)}`)).toHaveLength(40);
  });

  it('uses the first value when the parameter is repeated', () => {
    expect(parseCampaign('?src=facebook-post&src=other')).toBe('facebook-post');
  });

  it.each([
    ['no src parameter', '?utm_source=youtube'],
    ['an empty tag', '?src='],
    ['a tag with a space', '?src=youtube%20video'],
    ['a tag with an underscore', '?src=youtube_video'],
    ['a tag starting with a hyphen', '?src=-youtube'],
    ['a tag of 41 characters', `?src=a${'b'.repeat(40)}`],
    ['markup in the tag', '?src=%3Cscript%3Ealert(1)%3C%2Fscript%3E'],
  ])('returns null for %s', (_label, search) => {
    expect(parseCampaign(search)).toBeNull();
  });
});

describe('captureCampaign', () => {
  it('stores a valid tag and returns it', () => {
    const storage = memoryStorage();
    expect(captureCampaign('?src=youtube-description', storage)).toBe('youtube-description');
    expect(storage.data[CAMPAIGN_STORAGE_KEY]).toBe('youtube-description');
  });

  it('lets a newer tag replace an older one', () => {
    const storage = memoryStorage({ [CAMPAIGN_STORAGE_KEY]: 'youtube-comment' });
    expect(captureCampaign('?src=linkedin-post', storage)).toBe('linkedin-post');
    expect(storage.data[CAMPAIGN_STORAGE_KEY]).toBe('linkedin-post');
  });

  it('keeps the stored tag when the URL has none', () => {
    const storage = memoryStorage({ [CAMPAIGN_STORAGE_KEY]: 'youtube-endcard' });
    expect(captureCampaign('', storage)).toBe('youtube-endcard');
  });

  it('does not overwrite a stored tag with an invalid one', () => {
    const storage = memoryStorage({ [CAMPAIGN_STORAGE_KEY]: 'youtube-endcard' });
    expect(captureCampaign('?src=<bad>', storage)).toBe('youtube-endcard');
    expect(storage.data[CAMPAIGN_STORAGE_KEY]).toBe('youtube-endcard');
  });

  it('still returns the tag when storage is blocked', () => {
    expect(captureCampaign('?src=facebook-post', blockedStorage)).toBe('facebook-post');
  });

  it('works with no storage at all', () => {
    expect(captureCampaign('?src=facebook-post', null)).toBe('facebook-post');
    expect(captureCampaign('', null)).toBeNull();
  });
});

describe('currentCampaign', () => {
  it('returns null when nothing is stored', () => {
    expect(currentCampaign(memoryStorage())).toBeNull();
  });

  it('ignores a stored value that is not a safe tag', () => {
    expect(currentCampaign(memoryStorage({ [CAMPAIGN_STORAGE_KEY]: '<b>x</b>' }))).toBeNull();
  });

  it('returns null rather than throwing when storage is blocked', () => {
    expect(currentCampaign(blockedStorage)).toBeNull();
    expect(currentCampaign(null)).toBeNull();
  });
});

describe('withCampaign', () => {
  it('adds the tag as a campaign field', () => {
    expect(withCampaign({ email: 'a@b.co' }, 'youtube-comment')).toEqual({ email: 'a@b.co', campaign: 'youtube-comment' });
  });

  it('does not change the fields it was given', () => {
    const fields = Object.freeze({ email: 'a@b.co' });
    const result = withCampaign(fields, 'youtube-comment');
    expect(fields).toEqual({ email: 'a@b.co' });
    expect(result).not.toBe(fields);
  });

  it('leaves the fields alone when there is no tag', () => {
    expect(withCampaign({ email: 'a@b.co' }, null)).toEqual({ email: 'a@b.co' });
  });

  it('does not override a campaign field that is already present', () => {
    expect(withCampaign({ campaign: 'set-by-form' }, 'youtube-comment')).toEqual({ campaign: 'set-by-form' });
  });
});
