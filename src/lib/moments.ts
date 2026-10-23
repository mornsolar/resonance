export interface MomentOption {
  readonly value: string;
  readonly label: string;
}

export interface Trigger extends MomentOption {
  readonly reflection: string;
}

/** What happened just before an unplanned pick-up. Shared by the Try page and check-in Step 1. */
export const TRIGGERS: readonly Trigger[] = [
  {
    value: 'automatic',
    label: 'I did it automatically',
    reflection:
      "If it happened automatically, there wasn't really a decision to make. The habit got there before you did. That isn't a failure of willpower; it's simply what habits do.",
  },
  {
    value: 'bored',
    label: 'I was bored or waiting',
    reflection:
      "Waiting and boredom are when the phone is easiest to reach for. It fills the gap before we've even noticed there is one.",
  },
  {
    value: 'escape',
    label: 'I wanted to get away from an uncomfortable feeling',
    reflection:
      "Reaching for the phone to step away from a feeling is very human. It works for a moment, which is exactly why it's worth noticing.",
  },
  {
    value: 'notification',
    label: 'A notification caught my attention',
    reflection:
      "A notification is someone else's decision about when you pick up your phone. Noticing that is already taking a little of the decision back.",
  },
];

export const OUTCOMES: readonly MomentOption[] = [
  { value: 'intended', label: 'What I meant to do' },
  { value: 'elsewhere', label: 'Something else entirely' },
  { value: 'unsure', label: "I honestly can't remember" },
  { value: 'both', label: 'A bit of both' },
];

export const FEELINGS: readonly MomentOption[] = [
  { value: 'fine', label: 'Fine' },
  { value: 'flat', label: 'A bit flat' },
  { value: 'annoyed', label: 'Annoyed with myself' },
  { value: 'unnoticed', label: "I don't think I noticed" },
];

export const MOMENT_QUESTIONS = {
  trigger: 'Think about the last time you opened your phone without planning to. What happened just before?',
  outcome: 'What did you end up doing on it?',
  feeling: 'When you put it down, how did you feel?',
} as const;

export const ONE_THING_TO_TRY =
  "Next time you reach for your phone, pause for one breath and say, out loud or in your head, what you're picking it up for and for how long. That's all. No app, no tracking.";
