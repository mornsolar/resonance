import type { ContextQuestion, Dimension, ScoredQuestion } from './types';

/**
 * The three areas the check-in looks at. They group the six stages of the
 * venture's Theory of Change: Notice = awareness + reflection, Choose =
 * intentionality + habit, Belong = social reinforcement + identity.
 */
export const DIMENSIONS: readonly Dimension[] = [
  {
    id: 'notice',
    name: 'Notice',
    summary: 'Whether you catch the moments your phone takes over.',
  },
  {
    id: 'choose',
    name: 'Choose',
    summary: 'Whether you decide what it is for, and when to stop, before the feed decides for you.',
  },
  {
    id: 'belong',
    name: 'Belong',
    summary: 'Whether the people around you, and the way you see yourself, make the change easier.',
  },
];

/** Q1–Q10: practices about what people actually do. Each is worth 0–2 points. */
export const SCORED_QUESTIONS: readonly ScoredQuestion[] = [
  {
    id: 'cue',
    dimension: 'notice',
    prompt:
      'Think about the past week. When you reached for your phone without planning to, could you usually say what had happened just before?',
    options: [
      { value: 'usually', label: 'Usually, yes: boredom, waiting, a feeling, a buzz', points: 2 },
      { value: 'sometimes', label: 'Sometimes', points: 1 },
      { value: 'rarely', label: 'Rarely. It just happens', points: 0 },
    ],
    strength:
      "You often notice what sets off a pick-up. That's where everything else starts: you can't choose differently in a moment you never see.",
    action:
      "For the next day, when you catch yourself reaching for your phone, name what happened a second before: bored, waiting, a feeling, a buzz. Don't change anything yet. Naming it is the whole exercise.",
  },
  {
    id: 'drift',
    dimension: 'notice',
    prompt: 'When you drift away from what you opened your phone for, how soon do you usually notice?',
    options: [
      { value: 'quickly', label: 'Fairly quickly', points: 2 },
      { value: 'later', label: 'After a while', points: 1 },
      { value: 'after', label: 'Often only when I put it down, or not at all', points: 0 },
    ],
    strength:
      'You tend to notice drift while it is happening. That gives you a live choice point, which is exactly what endless feeds are built to remove.',
    action:
      'Pick the one app you drift in most. Each time you open it today, glance at the clock, and glance again when you close it. Just compare the two. No targets.',
  },
  {
    id: 'after',
    dimension: 'notice',
    prompt: "After a long stretch on your phone, do you notice how it's left you feeling?",
    options: [
      { value: 'usually', label: 'Usually', points: 2 },
      { value: 'sometimes', label: 'Sometimes', points: 1 },
      { value: 'rarely', label: 'Rarely. I just move on', points: 0 },
    ],
    strength:
      'You notice how a session leaves you. That quick "huh, that happened" tells you more than any screen-time number, because it is about your experience, not minutes.',
    action:
      'After your next long session, take five seconds to name one word for how you feel: fine, flat, wired, calm. Save the thinking for later, when your head is clearer.',
  },
  {
    id: 'purpose',
    dimension: 'choose',
    prompt: "Before you pick up your phone, do you know what you're picking it up for?",
    options: [
      { value: 'most', label: 'Most times', points: 2 },
      { value: 'sometimes', label: 'Sometimes', points: 1 },
      { value: 'rarely', label: 'Rarely', points: 0 },
    ],
    strength:
      'You often pick up your phone with a purpose in mind. That small decision before you unlock it is the one the rest of the session hangs on.',
    action:
      "Before your next five pick-ups, say in your head what it's for and roughly how long you need. If you can't name it, just notice that. You're still allowed to pick it up.",
  },
  {
    id: 'stop',
    dimension: 'choose',
    prompt:
      'When you open a feed (short videos, Reels, TikTok, YouTube Shorts, social media), do you decide beforehand roughly when you will stop?',
    options: [
      { value: 'most', label: 'Most times', points: 2 },
      { value: 'sometimes', label: 'Sometimes', points: 1 },
      { value: 'rarely', label: 'Rarely. I stop when something interrupts me', points: 0 },
    ],
    strength:
      "You tend to set a stopping point before you open a feed. In small lab studies, people capped at ten swipes didn't show the drop in remembering their own plans that unlimited swiping caused, so this habit may be doing more than it seems.",
    action:
      'Next time you open a short-video feed, pick a stopping point before the first swipe: ten videos, or one song. When you reach it, stop and decide again. You can carry on; the point is that carrying on becomes a decision.',
  },
  {
    id: 'notifications',
    dimension: 'choose',
    prompt:
      'Have you chosen which apps are allowed to interrupt you with notifications, or are most still on their default settings?',
    options: [
      { value: 'chosen', label: "I've chosen deliberately", points: 2 },
      { value: 'some', label: "I've turned a few off", points: 1 },
      { value: 'defaults', label: 'Mostly the defaults', points: 0 },
    ],
    strength:
      'You have decided who gets to interrupt you. Every notification you switched off is one less moment that someone else picks for you to reach for your phone.',
    action:
      'Open your notification settings and switch off the one app that pings you most and matters least. Just one. See whether you miss it by the end of the week.',
  },
  {
    id: 'phonefree',
    dimension: 'choose',
    prompt:
      'Are there times or places in your day that are phone-free because you chose it, such as meals, the first part of the morning, or bedtime?',
    options: [
      { value: 'most-days', label: 'Yes, most days', points: 2 },
      { value: 'occasionally', label: 'Occasionally', points: 1 },
      { value: 'no', label: 'Not really', points: 0 },
    ],
    strength:
      "You keep some parts of the day phone-free by choice. A fixed point like that doesn't depend on willpower in the moment, which is why it tends to hold.",
    action:
      'Choose one small, regular moment to make phone-free this week: the first 15 minutes after waking, one meal, or the last half hour before bed. Leave the phone in another room for it, rather than relying on willpower.',
  },
  {
    id: 'someone',
    dimension: 'belong',
    prompt: 'Does at least one person in your life know how you would like to use your phone differently?',
    options: [
      { value: 'talk', label: 'Yes, and we talk about it', points: 2 },
      { value: 'mentioned', label: "I've mentioned it once or twice", points: 1 },
      { value: 'no-one', label: 'No one, really', points: 0 },
    ],
    strength:
      'Someone else knows what you are aiming for. Telling one trusted person privately tends to help follow-through more than announcing it publicly.',
    action:
      'Tell one person you trust, privately, one thing you would like to change about how you use your phone. Not a public post. Just one person who might ask you how it is going.',
  },
  {
    id: 'shared',
    dimension: 'belong',
    prompt:
      'Do the people you spend the most time with share any phone habits you like, such as phones away at dinner?',
    options: [
      { value: 'few', label: 'Yes, we have a few', points: 2 },
      { value: 'loosely', label: 'One or two, loosely', points: 1 },
      { value: 'none', label: 'Not really', points: 0 },
    ],
    strength:
      'You share some phone habits with the people around you. Habits everyone keeps tend to hold better than solo ones, because nobody is left out.',
    action:
      'Suggest one shared phone-free moment to someone you live or spend time with, a meal or a walk, and frame it as a one-week experiment rather than a rule.',
  },
  {
    id: 'identity',
    dimension: 'belong',
    prompt: "Could you describe, in a sentence, the kind of phone user you'd like to be?",
    options: [
      { value: 'clearly', label: 'Yes, clearly', points: 2 },
      { value: 'roughly', label: 'Roughly', points: 1 },
      { value: 'not-yet', label: 'Not yet', points: 0 },
    ],
    strength:
      "You can picture the kind of phone user you want to be. Change that's about who you are tends to outlast change that's only about cutting minutes.",
    action:
      'Finish this sentence, just for yourself: "I\'m someone who uses my phone to…" Keep it somewhere you will see it. Each small choice that matches it is evidence that it is true.',
  },
];

/** Q11–Q15: context and preferences. Not scored; used to tailor the result and next steps. */
export const CONTEXT_QUESTIONS: readonly ContextQuestion[] = [
  {
    kind: 'choice',
    id: 'situation',
    prompt: 'Which best describes you right now?',
    options: [
      { value: 'self', label: "I'm mainly thinking about my own phone use" },
      { value: 'parent-both', label: "I'm a parent, thinking about my own use and my child's" },
      { value: 'parent-child', label: "I'm a parent, mainly thinking about my child's or teen's use" },
      { value: 'professional', label: 'I work with young people (teaching, youth work, counselling)' },
      { value: 'other', label: 'Something else' },
    ],
  },
  {
    kind: 'choice',
    id: 'goal',
    prompt: 'What would you most like to be different a month from now?',
    options: [
      { value: 'time', label: "Less time lost to scrolling I didn't choose" },
      { value: 'sleep', label: 'Better evenings and sleep' },
      { value: 'present', label: 'Being more present with the people around me' },
      { value: 'focus', label: 'Better focus for work or study' },
      { value: 'young-person', label: 'Helping a young person in my life' },
      { value: 'other', label: 'Something else' },
    ],
  },
  {
    kind: 'choice',
    id: 'obstacle',
    prompt: 'What has got in the way so far?',
    options: [
      { value: 'not-tried', label: "Honestly, I haven't really tried yet" },
      { value: 'apps-off', label: "I've tried limits or apps, but I end up switching them off" },
      { value: 'forget', label: "I make a plan when I'm calm, then forget it in the moment" },
      { value: 'reachable', label: 'Work or family need me to be reachable' },
      { value: 'everyone', label: 'Everyone around me is on their phone too' },
      { value: 'other', label: 'Something else' },
    ],
  },
  {
    kind: 'choice',
    id: 'help',
    prompt: 'What kind of help would actually be useful right now?',
    options: [
      { value: 'small', label: 'Something small to try on my own' },
      { value: 'structured', label: 'A short, structured programme, like a one-week reset' },
      { value: 'group', label: 'Doing it alongside a small group' },
      { value: 'conversation', label: "A conversation with someone who's thought about this" },
      { value: 'reading', label: 'Just reading and thinking for now' },
      { value: 'unsure', label: 'Not sure yet' },
    ],
  },
  {
    kind: 'text',
    id: 'comment',
    prompt: 'Anything about your situation, timing or priorities that would make your result more useful?',
    hint: 'Optional. A sentence is plenty.',
  },
];

export const TOTAL_QUESTIONS = SCORED_QUESTIONS.length + CONTEXT_QUESTIONS.length;

export function dimensionById(id: string): Dimension | undefined {
  return DIMENSIONS.find((dimension) => dimension.id === id);
}
