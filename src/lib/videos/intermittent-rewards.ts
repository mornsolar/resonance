// Copy for the intermittent-rewards video page. The chapters, sources and corrections match the video note in the
// vault (Content & Storytelling/Videos) and the on-screen notes in the uploaded version. No invented content.
import transcript from './intermittent-rewards.transcript.json';
import { parseTimestamp } from '../video';

export interface Chapter {
  time: string;
  title: string;
  startSeconds: number;
}

export interface Note {
  title: string;
  text: string;
  href?: string;
  linkText?: string;
}

export interface TranscriptBlock {
  start: number;
  text: string;
}

export const VIDEO = {
  id: 'TxRZGMaj0Hs',
  title: 'How intermittent rewards work: explained with a flushing toilet',
  summary:
    'Slot machines run on one idea: make the outcome unpredictable. In this video I build one out of a flushing toilet for toddlers, step by step, to show how intermittent (variable) rewards work, and why the same pattern shows up in pull-to-refresh, short videos and personalised feeds.',
  pageDescription:
    'A 15-minute video that builds a slot machine out of a flushing toilet to show how intermittent rewards work, with chapters, sources and a transcript.',
  uploadDate: '2026-11-01',
  durationSeconds: 884,
  thumbnail: '/videos/intermittent-rewards.webp',
  thumbnailAlt: 'The speaker smiling beside the words "A slot machine from a toilet?"',
} as const;

const CHAPTER_LIST: ReadonlyArray<readonly [string, string]> = [
  ['0:00', 'Who I am and why this video'],
  ['0:36', 'What intermittent rewards are'],
  ['1:56', 'The experiment: a slot machine from a flushing toilet'],
  ['2:58', 'Your phone has the same lever'],
  ['4:38', 'The 2.5-second rule for slot machines'],
  ['5:32', 'Why the brain chases patterns'],
  ['7:38', 'Making the outcome unpredictable'],
  ['9:05', 'Adding personalisation'],
  ['11:01', 'Short video and the shrinking loop'],
  ['12:23', 'Training the brain for the wrong thing'],
  ['13:38', 'What to do about it'],
];

export const CHAPTERS: readonly Chapter[] = CHAPTER_LIST.map(([time, title]) => ({
  time,
  title,
  startSeconds: parseTimestamp(time),
}));

/** From the founder's published LinkedIn post about the video. */
export const QUESTIONS = [
  'How short is the loop?',
  'How unpredictable is the reward?',
  'How much is it tuned to the individual?',
] as const;

export const CHECKED: readonly Note[] = [
  {
    title: 'The 2.5-second rule',
    text: 'The UK Gambling Commission requires at least 2.5 seconds per game cycle on online slots. It is a technical standard attached to operating licences (RTS 14D), so "rule" is more exact than "law", and it applies to online slots.',
    href: 'https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-14-responsible-product-design',
    linkText: 'UK Gambling Commission, RTS 14',
  },
  {
    title: 'About 47 seconds on a screen',
    text: "Gloria Mark's research puts the average time on one screen before switching at about 47 seconds, with a median of 40. It measures switching between screens, not how long a video is watched, so it is not a like-for-like comparison with the 5.2 seconds in the video.",
    href: 'https://gloriamark.com/attention-span/',
    linkText: 'Gloria Mark, Attention Span',
  },
  {
    title: 'Pull-to-refresh',
    text: 'Its inventor, Loren Brichter, told the Guardian he never intended the design to be addictive. The video says the resemblance to a slot machine lever is "too coincidental to be chance", which goes further than that. The resemblance is real; the intent is not something I can claim.',
    href: 'https://longreads.com/2017/10/10/immature-architects/',
    linkText: 'Longreads, quoting the Guardian (2017)',
  },
];

export const NOT_VERIFIED: readonly Note[] = [
  {
    title: '5.2 seconds',
    text: "I haven't been able to find a source for the figure that the average short video is watched for 5.2 seconds. Treat it as a rough illustration.",
  },
  {
    title: 'A drop in gambling addiction',
    text: "The video says gambling addiction is falling as addiction to social media rises, especially among young adults. I haven't found evidence for that claim yet, so please don't rely on it.",
  },
];

export const TRANSCRIPT: readonly TranscriptBlock[] = transcript;
