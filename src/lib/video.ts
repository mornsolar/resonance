/** Helpers for video pages: timestamps, and the two YouTube addresses we use. */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function checkedId(id: string): string {
  if (!YOUTUBE_ID.test(id)) throw new Error(`Not a YouTube video id: ${id}`);
  return id;
}

/** "1:56" becomes 116, "14:44" becomes 884, "1:02:03" becomes 3723. */
export function parseTimestamp(text: string): number {
  const parts = text.split(':').map(Number);
  const isValid =
    parts.length >= 2 &&
    parts.length <= 3 &&
    parts.every((part) => Number.isInteger(part) && part >= 0) &&
    parts.slice(1).every((part) => part < 60);
  if (!isValid) throw new Error(`Not a timestamp: ${text}`);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/** 116 becomes "1:56", 3723 becomes "1:02:03". */
export function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

/** The plain YouTube link, optionally starting at a moment. */
export function youtubeWatchUrl(id: string, startSeconds = 0): string {
  const base = `https://youtu.be/${checkedId(id)}`;
  return startSeconds > 0 ? `${base}?t=${Math.floor(startSeconds)}` : base;
}

/** The privacy-enhanced embed address (youtube-nocookie.com). Only ever loaded after the visitor presses play. */
export function youtubeEmbedUrl(id: string, options: { startSeconds?: number; autoplay?: boolean } = {}): string {
  const params = new URLSearchParams({ rel: '0' });
  if (options.startSeconds && options.startSeconds > 0) params.set('start', String(Math.floor(options.startSeconds)));
  if (options.autoplay) params.set('autoplay', '1');
  return `https://www.youtube-nocookie.com/embed/${checkedId(id)}?${params}`;
}
