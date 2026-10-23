import { CONTEXT_QUESTIONS, DIMENSIONS, SCORED_QUESTIONS } from './questions';
import type { Answers, Band, BandId, CheckinScore, DimensionId, DimensionScore, NextSteps, ScoredQuestion } from './types';

export const MAX_POINTS_PER_QUESTION = 2;

/** Lowest total for each band. Illustrative cut-offs from the pilot design, to revisit with real results. */
export const BAND_FLOORS: Readonly<Record<BandId, number>> = { defaults: 0, some: 8, mostly: 15 };

/** Below this share of its points, the Choose dimension counts as mostly missing. */
export const CHOOSE_GAP_RATIO = 0.5;

const BANDS: readonly Band[] = [
  {
    id: 'mostly',
    label: 'Mostly choosing',
    summary:
      "Many of the habits this check-in looks for are already part of your life. The useful question for you probably isn't how to cut back, but what keeps this working and where it still slips.",
  },
  {
    id: 'some',
    label: 'Choosing some of the time',
    summary:
      'You already make some deliberate choices, and some moments still slip past. The gaps are usually specific, which makes them easier to work on than a general "use my phone less".',
  },
  {
    id: 'defaults',
    label: 'Running on defaults',
    summary:
      "Right now your phone's defaults are making most of the choices: when to pick it up, what comes next, when to stop. That's exactly what they are designed to do. It says nothing about your willpower, and it's the easiest place to start.",
  },
];

const RESET_HELP_PREFERENCES = new Set(['structured', 'group', 'conversation']);
const RESET_OBSTACLES = new Set(['forget', 'apps-off']);
const ADULT_ONLY_SITUATIONS = new Set(['parent-child', 'professional']);

export function pointsFor(question: ScoredQuestion, value: string | undefined): number {
  return question.options.find((option) => option.value === value)?.points ?? 0;
}

export function bandFor(total: number): Band {
  const band = BANDS.find((candidate) => total >= BAND_FLOORS[candidate.id]);
  return band ?? BANDS[BANDS.length - 1];
}

export function scoreCheckin(answers: Answers): CheckinScore {
  const dimensions: DimensionScore[] = DIMENSIONS.map(({ id }) => {
    const questions = SCORED_QUESTIONS.filter((question) => question.dimension === id);
    return {
      id,
      points: questions.reduce((sum, question) => sum + pointsFor(question, answers[question.id]), 0),
      max: questions.length * MAX_POINTS_PER_QUESTION,
    };
  });
  const total = dimensions.reduce((sum, dimension) => sum + dimension.points, 0);
  const max = SCORED_QUESTIONS.length * MAX_POINTS_PER_QUESTION;
  return { total, max, band: bandFor(total), dimensions };
}

export function ratioOf(dimension: DimensionScore): number {
  return dimension.max === 0 ? 0 : dimension.points / dimension.max;
}

/** The dimension with the lowest share of its points; ties go to the earliest Theory of Change stage. */
export function weakestDimension(score: CheckinScore): DimensionId {
  const weakest = score.dimensions.reduce((lowest, dimension) =>
    ratioOf(dimension) < ratioOf(lowest) ? dimension : lowest,
  );
  return weakest.id;
}

/** Every scored question and every multiple-choice context question has an answer. */
export function isComplete(answers: Answers): boolean {
  const required = [
    ...SCORED_QUESTIONS.map((question) => question.id),
    ...CONTEXT_QUESTIONS.filter((question) => question.kind === 'choice').map((question) => question.id),
  ];
  return required.every((id) => Boolean(answers[id]));
}

function chooseRatio(score: CheckinScore): number {
  const choose = score.dimensions.find((dimension) => dimension.id === 'choose');
  return choose ? ratioOf(choose) : 0;
}

export function recommendNextSteps(answers: Answers, score: CheckinScore): NextSteps {
  const focus = weakestDimension(score);
  const prefersConversation = answers.help === 'conversation';

  if (ADULT_ONLY_SITUATIONS.has(answers.situation ?? '')) {
    return { focus, resetFit: 'for-adults', prefersConversation };
  }

  const wantsStructure = RESET_HELP_PREFERENCES.has(answers.help ?? '');
  const plansSlip = RESET_OBSTACLES.has(answers.obstacle ?? '');
  const choosingIsHard = chooseRatio(score) < CHOOSE_GAP_RATIO;
  const resetFit = wantsStructure || plansSlip || choosingIsHard ? 'recommended' : 'optional';

  return { focus, resetFit, prefersConversation };
}
