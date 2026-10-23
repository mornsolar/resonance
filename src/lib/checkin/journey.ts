import { scoreCheckin, ratioOf, CHOOSE_GAP_RATIO } from './scoring';
import type { Answers, DimensionId, ResetFit } from './types';

export interface StepOneCopy {
  readonly title: string;
  readonly lede: string;
  readonly why: string;
}

/** Step 1: a two-minute exercise aimed at the person's weakest area. */
export const STEP_ONE: Readonly<Record<DimensionId, StepOneCopy>> = {
  notice: {
    title: 'Catch one moment',
    lede: 'Three quick questions about the last time you picked up your phone without meaning to. Nothing to change yet. This is just noticing.',
    why: "Notice was your lowest area. You can't choose differently in a moment you never see, so this step is about seeing one clearly.",
  },
  choose: {
    title: 'Declare one pick-up',
    lede: 'Before you next unlock your phone, decide what it is for, which app, and for how long. This is the one-week reset in miniature.',
    why: 'Choose was your lowest area. The smallest version of choosing is deciding before you unlock, rather than noticing afterwards that you drifted.',
  },
  belong: {
    title: 'Name it, and tell one person',
    lede: 'Write one sentence about the kind of phone user you want to be, and pick one person to tell.',
    why: 'Belong was your lowest area. Change tends to stick when it is about who you are, and when someone else knows about it.',
  },
};

export interface StepTwoCopy {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
}

export const STEP_TWO: Readonly<Record<ResetFit, StepTwoCopy>> = {
  recommended: {
    eyebrow: 'Suggested for you',
    heading: 'Run the full week, alongside me',
    body: 'From your answers, a structured week could suit you.',
  },
  optional: {
    eyebrow: 'If you want to go further',
    heading: 'The one-week reset is here if you want it',
    body: "You may not need a structured week. Step 1 and the Sunday Pause might be plenty, and that's a perfectly good outcome. If you're curious anyway, you're welcome.",
  },
  'for-adults': {
    eyebrow: 'A note before you sign up',
    heading: 'The one-week reset is for adults, on their own phones',
    body: "If you're a parent, one option is to start with your own phone, since it's the one you can change today. If you'd rather talk about the young person in your life, a 15-minute chat is the better next step.",
  },
};

const HELP_REASONS: Readonly<Record<string, string>> = {
  structured: 'you said a short, structured programme would help',
  group: "you said you'd like to do this alongside other people",
  conversation: 'you said a conversation would help, and you can book one below before deciding anything',
};

const OBSTACLE_REASONS: Readonly<Record<string, string>> = {
  forget: 'you said plans slip in the moment, and the week puts the decision right at the moment you pick up your phone',
  'apps-off': "you said app limits end up switched off, and in this week you set the rule yourself, so there's no app to resent",
};

const CHOOSE_REASON = 'your answers suggest that deciding before you pick up your phone is the hardest part, which is exactly what the week practises';

/** Plain-language reasons the reset is suggested, drawn from the person's own answers. */
export function resetReasons(answers: Answers): readonly string[] {
  const choose = scoreCheckin(answers).dimensions.find((dimension) => dimension.id === 'choose');
  const reasons = [
    HELP_REASONS[answers.help ?? ''],
    OBSTACLE_REASONS[answers.obstacle ?? ''],
    choose && ratioOf(choose) < CHOOSE_GAP_RATIO ? CHOOSE_REASON : undefined,
  ];
  return reasons.filter((reason): reason is string => Boolean(reason));
}
