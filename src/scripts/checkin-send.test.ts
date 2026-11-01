import { afterEach, describe, expect, it, vi } from 'vitest';
import { CAMPAIGN_STORAGE_KEY } from '../lib/campaign';
import { sendFields } from './checkin-send';

const stubSession = (data: Record<string, string>) =>
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  });

const stubFetch = (result: { ok: boolean } | Error) => {
  const fetchMock = vi.fn(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const postedFields = (fetchMock: ReturnType<typeof stubFetch>): Record<string, string> => {
  const init = (fetchMock.mock.calls[0] as unknown as [string, { body: FormData }])[1];
  return Object.fromEntries(Array.from(init.body.entries()) as [string, string][]);
};

afterEach(() => vi.unstubAllGlobals());

describe('sendFields', () => {
  it('adds the campaign tag when the visitor arrived through a tagged link', async () => {
    stubSession({ [CAMPAIGN_STORAGE_KEY]: 'youtube-endcard' });
    const fetchMock = stubFetch({ ok: true });
    await expect(sendFields('https://example.test/form', { email: 'a@b.co' })).resolves.toBe(true);
    expect(postedFields(fetchMock)).toEqual({ email: 'a@b.co', campaign: 'youtube-endcard' });
  });

  it('sends only the given fields when there is no tag', async () => {
    stubSession({});
    const fetchMock = stubFetch({ ok: true });
    await sendFields('https://example.test/form', { email: 'a@b.co' });
    expect(postedFields(fetchMock)).toEqual({ email: 'a@b.co' });
  });

  it('ignores a stored tag that is not safe', async () => {
    stubSession({ [CAMPAIGN_STORAGE_KEY]: '<script>' });
    const fetchMock = stubFetch({ ok: true });
    await sendFields('https://example.test/form', { email: 'a@b.co' });
    expect(postedFields(fetchMock)).toEqual({ email: 'a@b.co' });
  });

  it('returns false when the endpoint refuses the fields', async () => {
    stubSession({});
    stubFetch({ ok: false });
    await expect(sendFields('https://example.test/form', { email: 'a@b.co' })).resolves.toBe(false);
  });

  it('returns false when the network fails', async () => {
    stubSession({});
    stubFetch(new Error('offline'));
    await expect(sendFields('https://example.test/form', { email: 'a@b.co' })).resolves.toBe(false);
  });
});
