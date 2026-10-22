import { SCORED_QUESTIONS, dimensionById } from './questions';
import { pointsFor, weakestDimension } from './scoring';
import type { Answers, CheckinScore, Insight, ScoredQuestion } from './types';

const NO_STRENGTH_YET =
  'You just spent a few minutes looking honestly at how you use your phone, without anyone asking you to. That is the same muscle every other change here is built on.';

/** Third insight, chosen by what the person said has got in the way (Q13). */
const OBSTACLE_INSIGHTS: Readonly<Record<string, string>> = {
  forget:
    "You said you make a plan when you're calm, then lose it in the moment. That isn't a willpower problem. In small lab studies, people who scrolled short-video feeds without limits were worse afterwards at remembering intentions they had made earlier; people capped at ten swipes weren't. They are single-session studies, so treat this as a clue rather than a verdict, but it suggests the fix is a decision point in the moment, not a better plan in advance.",
  'apps-off':
    "You said you've tried limits or apps but end up switching them off. That's very common, and it's worth asking who set the rule. A limit an app hands you is easy to resent and override. The one-week reset tests a different idea: you set the rule yourself, for a fixed stretch, and then keep it.",
  reachable:
    "You need to stay reachable. That rules out switching off, but it doesn't rule out choosing who can reach you. Calls and messages from the people who matter can stay on while everything else waits.",
  everyone:
    "You said everyone around you is on their phone too. That matters more than it sounds: it's hard to be the only one at the table without a phone. Shared habits, even small ones, take that pressure away because nobody is left out.",
  'not-tried':
    "You haven't really tried yet, which is a fine place to be. You can start with something small and see what you learn, rather than undoing a pile of past attempts.",
};

const DEFAULT_OBSTACLE_INSIGHT =
  'Whatever has been in the way, the most useful next move is usually small and specific: one moment, one choice, one week. That is what the two steps below are for.';

function strongestQuestion(answers: Answers): ScoredQuestion | undefined {
  const best = SCORED_QUESTIONS.reduce<ScoredQuestion | undefined>((top, question) => {
    if (!top) return question;
    return pointsFor(question, answers[question.id]) > pointsFor(top, answers[top.id]) ? question : top;
  }, undefined);
  return best && pointsFor(best, answers[best.id]) > 0 ? best : undefined;
}

function lowestQuestionIn(answers: Answers, dimensionId: string): ScoredQuestion | undefined {
  return SCORED_QUESTIONS.filter((question) => question.dimension === dimensionId).reduce<
    ScoredQuestion | undefined
  >((low, question) => {
    if (!low) return question;
    return pointsFor(question, answers[question.id]) < pointsFor(low, answers[low.id]) ? question : low;
  }, undefined);
}

export function buildInsights(answers: Answers, score: CheckinScore): readonly Insight[] {
  const strongest = strongestQuestion(answers);
  const focus = weakestDimension(score);
  const opportunity = lowestQuestionIn(answers, focus);
  const focusName = dimensionById(focus)?.name ?? focus;

  return [
    { kind: 'strength', title: "What's already working", body: strongest?.strength ?? NO_STRENGTH_YET },
    { kind: 'opportunity', title: `Your biggest opportunity: ${focusName}`, body: opportunity?.action ?? '' },
    {
      kind: 'context',
      title: 'About what has been getting in the way',
      body: OBSTACLE_INSIGHTS[answers.obstacle ?? ''] ?? DEFAULT_OBSTACLE_INSIGHT,
    },
  ];
}
