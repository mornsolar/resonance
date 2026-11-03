import { describe, expect, it } from 'vitest';
import { formatTimestamp, parseTimestamp, youtubeEmbedUrl, youtubeWatchUrl } from './video';

describe('parseTimestamp', () => {
  it.each([
    ['0:00', 0],
    ['0:36', 36],
    ['1:56', 116],
    ['14:44', 884],
    ['1:02:03', 3723],
  ])('reads %s as %i seconds', (text, seconds) => {
    expect(parseTimestamp(text)).toBe(seconds);
  });

  it.each(['', '5', '1:2:3:4', 'a:bc', '1:75', '-1:30', '1.5:30'])('rejects %j', (text) => {
    expect(() => parseTimestamp(text)).toThrow('Not a timestamp');
  });
});

describe('formatTimestamp', () => {
  it.each([
    [0, '0:00'],
    [9, '0:09'],
    [116, '1:56'],
    [884, '14:44'],
    [3723, '1:02:03'],
  ])('writes %i seconds as %s', (seconds, text) => {
    expect(formatTimestamp(seconds)).toBe(text);
  });

  it('rounds down fractions and clamps negatives to zero', () => {
    expect(formatTimestamp(116.9)).toBe('1:56');
    expect(formatTimestamp(-5)).toBe('0:00');
  });

  it('round-trips with parseTimestamp', () => {
    for (const seconds of [0, 36, 116, 884, 3723]) expect(parseTimestamp(formatTimestamp(seconds))).toBe(seconds);
  });
});

describe('youtubeWatchUrl', () => {
  it('builds the plain link', () => {
    expect(youtubeWatchUrl('TxRZGMaj0Hs')).toBe('https://youtu.be/TxRZGMaj0Hs');
  });

  it('adds a start time, rounded down', () => {
    expect(youtubeWatchUrl('TxRZGMaj0Hs', 116.7)).toBe('https://youtu.be/TxRZGMaj0Hs?t=116');
  });

  it.each(['', 'short', 'has spaces!!', 'way-too-long-for-an-id', '<script>alert(1)</script>'])(
    'rejects the id %j',
    (id) => {
      expect(() => youtubeWatchUrl(id)).toThrow('Not a YouTube video id');
    },
  );
});

describe('youtubeEmbedUrl', () => {
  it('uses the privacy-enhanced domain and asks for no related videos from other channels', () => {
    expect(youtubeEmbedUrl('TxRZGMaj0Hs')).toBe('https://www.youtube-nocookie.com/embed/TxRZGMaj0Hs?rel=0');
  });

  it('adds a start time and autoplay when asked', () => {
    const address = new URL(youtubeEmbedUrl('TxRZGMaj0Hs', { startSeconds: 116, autoplay: true }));
    expect(address.hostname).toBe('www.youtube-nocookie.com');
    expect(address.searchParams.get('start')).toBe('116');
    expect(address.searchParams.get('autoplay')).toBe('1');
  });

  it('leaves out start and autoplay by default, and for a start of zero', () => {
    const address = new URL(youtubeEmbedUrl('TxRZGMaj0Hs', { startSeconds: 0 }));
    expect(address.searchParams.has('start')).toBe(false);
    expect(address.searchParams.has('autoplay')).toBe(false);
  });

  it('rejects an invalid id', () => {
    expect(() => youtubeEmbedUrl('nope')).toThrow('Not a YouTube video id');
  });
});
