import { describe, expect, test } from 'vitest';
import { CONTEXT_QUESTIONS, DIMENSIONS, SCORED_QUESTIONS } from './questions';
import { buildInsights } from './insights';
import { bandFor, isComplete, recommendNextSteps, scoreCheckin, weakestDimension } from './scoring';
import type { Answers, Points } from './types';

/** Answers every scored question with the option worth `points`, plus optional overrides. */
function answersAt(points: Points, overrides: Record<string, string> = {}): Answers {
  const scored = Object.fromEntries(
    SCORED_QUESTIONS.map((question) => {
      const option = question.options.find((candidate) => candidate.points === points);
      return [question.id, option?.value ?? ''];
    }),
  );
  return { situation: 'self', goal: 'time', obstacle: 'not-tried', help: 'small', ...scored, ...overrides };
}

/** Value of the option worth `points` for one question. */
function valueAt(questionId: string, points: Points): string {
  const question = SCORED_QUESTIONS.find((candidate) => candidate.id === questionId);
  return question?.options.find((option) => option.points === points)?.value ?? '';
}

describe('question data', () => {
  test('has ten scored questions, each with options worth 2, 1 and 0', () => {
    expect(SCORED_QUESTIONS).toHaveLength(10);
    for (const question of SCORED_QUESTIONS) {
      expect(question.options.map((option) => option.points)).toEqual([2, 1, 0]);
    }
  });

  test('uses unique ids across scored and context questions', () => {
    const ids = [...SCORED_QUESTIONS, ...CONTEXT_QUESTIONS].map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('gives every dimension at least three questions', () => {
    for (const dimension of DIMENSIONS) {
      const count = SCORED_QUESTIONS.filter((question) => question.dimension === dimension.id).length;
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('scoreCheckin', () => {
  test('scores 20 of 20 when every practice is in place', () => {
    const score = scoreCheckin(answersAt(2));
    expect(score.total).toBe(20);
    expect(score.max).toBe(20);
    expect(score.band.id).toBe('mostly');
  });

  test('scores 0 when no practice is in place', () => {
    const score = scoreCheckin(answersAt(0));
    expect(score.total).toBe(0);
    expect(score.band.id).toBe('defaults');
  });

  test('splits points by dimension with fixed maximums', () => {
    const score = scoreCheckin(answersAt(1));
    expect(score.dimensions).toEqual([
      { id: 'notice', points: 3, max: 6 },
      { id: 'choose', points: 4, max: 8 },
      { id: 'belong', points: 3, max: 6 },
    ]);
  });

  test('treats missing or unknown answers as zero rather than failing', () => {
    const score = scoreCheckin({ cue: 'usually', drift: 'not-an-option' });
    expect(score.total).toBe(2);
    expect(score.max).toBe(20);
  });
});

describe('bandFor', () => {
  test.each([
    [0, 'defaults'],
    [7, 'defaults'],
    [8, 'some'],
    [14, 'some'],
    [15, 'mostly'],
    [20, 'mostly'],
  ])('puts a total of %i in the "%s" band', (total, band) => {
    expect(bandFor(total).id).toBe(band);
  });
});

describe('weakestDimension', () => {
  test('picks the dimension with the lowest share of its points', () => {
    const answers = answersAt(2, { someone: valueAt('someone', 0), shared: valueAt('shared', 0) });
    expect(weakestDimension(scoreCheckin(answers))).toBe('belong');
  });

  test('breaks ties in Theory of Change order, earliest stage first', () => {
    expect(weakestDimension(scoreCheckin(answersAt(1)))).toBe('notice');
  });
});

describe('isComplete', () => {
  test('needs every scored and multiple-choice context question answered', () => {
    expect(isComplete(answersAt(1))).toBe(true);
    expect(isComplete({ ...answersAt(1), help: '' })).toBe(false);
  });

  test('does not need the optional comment', () => {
    expect(isComplete(answersAt(1, { comment: '' }))).toBe(true);
  });
});

describe('buildInsights', () => {
  test('returns a strength, an opportunity and a context insight', () => {
    const insights = buildInsights(answersAt(1), scoreCheckin(answersAt(1)));
    expect(insights.map((insight) => insight.kind)).toEqual(['strength', 'opportunity', 'context']);
  });

  test('names the strongest practice as the strength', () => {
    const answers = answersAt(0, { identity: valueAt('identity', 2) });
    const [strength] = buildInsights(answers, scoreCheckin(answers));
    const identity = SCORED_QUESTIONS.find((question) => question.id === 'identity');
    expect(strength.body).toBe(identity?.strength);
  });

  test('still offers a kind strength when every answer scored zero', () => {
    const [strength] = buildInsights(answersAt(0), scoreCheckin(answersAt(0)));
    expect(strength.body.length).toBeGreaterThan(0);
  });

  test('takes the opportunity from the lowest practice in the weakest dimension', () => {
    const answers = answersAt(2, { stop: valueAt('stop', 0), purpose: valueAt('purpose', 1) });
    const [, opportunity] = buildInsights(answers, scoreCheckin(answers));
    const stop = SCORED_QUESTIONS.find((question) => question.id === 'stop');
    expect(opportunity.title).toContain('Choose');
    expect(opportunity.body).toBe(stop?.action);
  });

  test('tailors the context insight to the obstacle', () => {
    const forget = buildInsights(answersAt(1, { obstacle: 'forget' }), scoreCheckin(answersAt(1)));
    const other = buildInsights(answersAt(1, { obstacle: 'other' }), scoreCheckin(answersAt(1)));
    expect(forget[2].body).not.toBe(other[2].body);
    expect(forget[2].body).toContain('swipes');
  });
});

describe('recommendNextSteps', () => {
  test('focuses step one on the weakest dimension', () => {
    const answers = answersAt(2, { cue: valueAt('cue', 0), after: valueAt('after', 0) });
    expect(recommendNextSteps(answers, scoreCheckin(answers)).focus).toBe('notice');
  });

  test.each(['parent-child', 'professional'])(
    'explains the reset is for adults when the situation is "%s"',
    (situation) => {
      const answers = answersAt(1, { situation, help: 'structured' });
      expect(recommendNextSteps(answers, scoreCheckin(answers)).resetFit).toBe('for-adults');
    },
  );

  test.each(['structured', 'group', 'conversation'])('recommends the reset when someone wants "%s" help', (help) => {
    const answers = answersAt(2, { help });
    expect(recommendNextSteps(answers, scoreCheckin(answers)).resetFit).toBe('recommended');
  });

  test('recommends the reset when plans keep slipping in the moment', () => {
    const answers = answersAt(2, { obstacle: 'forget', help: 'reading' });
    expect(recommendNextSteps(answers, scoreCheckin(answers)).resetFit).toBe('recommended');
  });

  test('recommends the reset when the Choose practices are mostly missing', () => {
    const answers = answersAt(2, {
      purpose: valueAt('purpose', 0),
      stop: valueAt('stop', 0),
      notifications: valueAt('notifications', 1),
      help: 'unsure',
    });
    expect(recommendNextSteps(answers, scoreCheckin(answers)).resetFit).toBe('recommended');
  });

  test('keeps the reset optional for someone doing well who wants to read', () => {
    const answers = answersAt(2, { help: 'reading' });
    expect(recommendNextSteps(answers, scoreCheckin(answers)).resetFit).toBe('optional');
  });

  test('flags a preference for a conversation', () => {
    const answers = answersAt(1, { help: 'conversation' });
    expect(recommendNextSteps(answers, scoreCheckin(answers)).prefersConversation).toBe(true);
    expect(recommendNextSteps(answersAt(1), scoreCheckin(answersAt(1))).prefersConversation).toBe(false);
  });
});
