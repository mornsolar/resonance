import { describe, expect, it } from 'vitest';
import { CHAPTERS, CHECKED, NOT_VERIFIED, QUESTIONS, TRANSCRIPT, VIDEO } from './intermittent-rewards';

// YouTube turns a description into chapters only if the first is at 0:00, there are at least three,
// and each lasts at least 10 seconds.
describe('chapters', () => {
  it('start at 0:00 and there are at least three', () => {
    expect(CHAPTERS[0].startSeconds).toBe(0);
    expect(CHAPTERS.length).toBeGreaterThanOrEqual(3);
  });

  it('are in order, at least 10 seconds apart, and end inside the video', () => {
    CHAPTERS.forEach((chapter, index) => {
      if (index > 0) expect(chapter.startSeconds - CHAPTERS[index - 1].startSeconds).toBeGreaterThanOrEqual(10);
    });
    expect(VIDEO.durationSeconds - CHAPTERS[CHAPTERS.length - 1].startSeconds).toBeGreaterThanOrEqual(10);
  });
});

describe('transcript', () => {
  it('has text in every block, in order, inside the video', () => {
    TRANSCRIPT.forEach((block, index) => {
      expect(block.text.trim().length).toBeGreaterThan(0);
      expect(block.start).toBeLessThan(VIDEO.durationSeconds);
      if (index > 0) expect(block.start).toBeGreaterThan(TRANSCRIPT[index - 1].start);
    });
  });
});

describe('sources', () => {
  it('link only to https addresses', () => {
    for (const note of CHECKED) {
      expect(note.href).toMatch(/^https:\/\//);
      expect(note.linkText).toBeTruthy();
    }
  });

  it('keep the unverified claims free of links, so nothing implies they are sourced', () => {
    for (const note of NOT_VERIFIED) expect(note.href).toBeUndefined();
  });
});

describe('copy rules', () => {
  const allCopy = [
    VIDEO.title,
    VIDEO.summary,
    VIDEO.pageDescription,
    VIDEO.thumbnailAlt,
    ...CHAPTERS.map((chapter) => chapter.title),
    ...QUESTIONS,
    ...[...CHECKED, ...NOT_VERIFIED].flatMap((note) => [note.title, note.text, note.linkText ?? '']),
    ...TRANSCRIPT.map((block) => block.text),
  ].join('\n');

  it('uses no em dashes', () => {
    expect(allCopy).not.toContain('—');
  });

  it('never uses the old brand name', () => {
    expect(allCopy).not.toMatch(/resonance/i);
  });

  it('does not repeat the "brain rot" or "brain drain" claims the research does not support', () => {
    expect(allCopy).not.toMatch(/brain rot|brain drain/i);
  });
});
