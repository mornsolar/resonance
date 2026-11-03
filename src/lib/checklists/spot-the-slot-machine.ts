// Copy for the "Spot the slot machine" checklist. The three questions come from the intermittent-rewards video;
// the 2.5-second rule is the one checked in src/lib/videos/intermittent-rewards.ts. No invented research.

export interface Question {
  id: string;
  heading: string;
  checks: readonly string[];
  /** Where the question comes from in the video. */
  fromTheVideo: string;
}

export const CHECKLIST_TAG = 'spot-checklist';

export const INTRO =
  "Three questions to ask of any app that keeps pulling you back. It's a way to notice a pattern. It doesn't diagnose the app, or you.";

export const HOW_TO = 'Pick one app. Open it and use it for two minutes as you normally would. Then tick what you noticed.';

export const QUESTIONS: readonly Question[] = [
  {
    id: 'loop',
    heading: 'How short is the loop?',
    checks: [
      'One pull, swipe or tap gives me the next thing',
      'There is no natural stopping point',
      'The next item arrives in a second or two',
    ],
    fromTheVideo:
      'Online slots in the UK must take at least 2.5 seconds per game (a Gambling Commission requirement). Does your feed leave any gap at all?',
  },
  {
    id: 'unpredictable',
    heading: 'How unpredictable is the reward?',
    checks: [
      "I can't tell whether the next one will be good",
      "Sometimes it's great, and most of the time it isn't",
      'Refreshing might give me something new, or nothing',
    ],
    fromTheVideo: 'The flushing toilet only becomes a slot machine once the outcome is unpredictable.',
  },
  {
    id: 'tuned',
    heading: 'How tuned is it to me?',
    checks: [
      'What I see changes based on what I did before',
      'It seems to know what holds my attention',
      "A friend's version of the app would look different",
    ],
    fromTheVideo: 'Personalisation is the third lever: the more it is tuned to you, the harder it is to put down.',
  },
];

export const HOW_TO_READ = [
  'Ticks under all three questions: the pattern is strong in this app.',
  'Ticks under one or two: it is partly there.',
  'No ticks: this app is not pulling on these levers.',
] as const;

export const READING_CAVEAT =
  "These bands are my own rule of thumb, a starting guess and not a validated scale. Knowing the pattern doesn't switch it off. It gives you the chance to notice it sooner.";

export const PERSONALISATION_NOTE =
  '"A friend\'s version would look different" is my own plain-language test for personalisation, not a research finding.';
