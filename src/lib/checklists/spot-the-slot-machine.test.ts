import { describe, expect, it } from 'vitest';
import { CAMPAIGN_PARAM, parseCampaign } from '../campaign';
import {
  CHECKLIST_TAG,
  HOW_TO,
  HOW_TO_READ,
  INTRO,
  PERSONALISATION_NOTE,
  QUESTIONS,
  READING_CAVEAT,
} from './spot-the-slot-machine';

describe('checklist structure', () => {
  it('has the three questions from the video, each with three checks', () => {
    expect(QUESTIONS.map((question) => question.id)).toEqual(['loop', 'unpredictable', 'tuned']);
    for (const question of QUESTIONS) expect(question.checks).toHaveLength(3);
  });

  it('uses a campaign tag the site will accept', () => {
    expect(parseCampaign(`?${CAMPAIGN_PARAM}=${CHECKLIST_TAG}`)).toBe(CHECKLIST_TAG);
  });
});

describe('copy rules', () => {
  const allCopy = [
    INTRO,
    HOW_TO,
    READING_CAVEAT,
    PERSONALISATION_NOTE,
    ...HOW_TO_READ,
    ...QUESTIONS.flatMap((question) => [question.heading, question.fromTheVideo, ...question.checks]),
  ].join('\n');

  it('uses no em dashes and no exclamation marks', () => {
    expect(allCopy).not.toContain('—');
    expect(allCopy).not.toContain('!');
  });

  it('never uses the old brand name', () => {
    expect(allCopy).not.toMatch(/resonance/i);
  });

  it('leaves out the claims that are not verified or not supported', () => {
    expect(allCopy).not.toMatch(/5\.2|brain rot|brain drain|addict/i);
  });

  it('labels its own rules of thumb as such', () => {
    expect(READING_CAVEAT).toMatch(/rule of thumb/);
    expect(PERSONALISATION_NOTE).toMatch(/my own/);
  });
});
