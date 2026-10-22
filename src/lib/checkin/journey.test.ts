import { describe, expect, test } from 'vitest';
import { resetReasons } from './journey';
import { scoreCheckin } from './scoring';
import { buildSubmission } from './submission';

const MIDDLE: Record<string, string> = {
  cue: 'sometimes',
  drift: 'later',
  after: 'sometimes',
  purpose: 'sometimes',
  stop: 'sometimes',
  notifications: 'some',
  phonefree: 'occasionally',
  someone: 'mentioned',
  shared: 'loosely',
  identity: 'roughly',
  situation: 'self',
  goal: 'sleep',
  obstacle: 'not-tried',
  help: 'small',
  comment: '  Night shifts make evenings hard.  ',
};

describe('resetReasons', () => {
  test('gives no reasons when nothing in the answers points to the reset', () => {
    expect(resetReasons(MIDDLE)).toEqual([]);
  });

  test('explains each reason in the person’s own terms', () => {
    const reasons = resetReasons({ ...MIDDLE, help: 'structured', obstacle: 'forget', purpose: 'rarely', stop: 'rarely' });
    expect(reasons).toHaveLength(3);
    expect(reasons[0]).toContain('structured');
    expect(reasons[1]).toContain('plans slip');
    expect(reasons[2]).toContain('deciding before');
  });
});

describe('buildSubmission', () => {
  const score = scoreCheckin(MIDDLE);

  test('summarises the score in the subject line and score fields', () => {
    const fields = buildSubmission(MIDDLE, score, { name: '', email: '', wantsSundayPause: false });
    expect(fields._subject).toBe('Phone check-in: 10/20, Choosing some of the time');
    expect(fields.score_notice).toBe('3/6');
    expect(fields.focus).toBe('notice');
    expect(fields.form).toBe('phone-check-in');
  });

  test('writes every answer as readable text, numbered in question order', () => {
    const fields = buildSubmission(MIDDLE, score, { name: '', email: '', wantsSundayPause: false });
    expect(fields.q01_cue).toBe('Sometimes (1)');
    expect(fields.q12_goal).toBe('Better evenings and sleep');
    expect(fields.q15_comment).toBe('Night shifts make evenings hard.');
  });

  test('only includes name and email when the person gave them', () => {
    const anonymous = buildSubmission(MIDDLE, score, { name: ' ', email: '', wantsSundayPause: false });
    expect(anonymous).not.toHaveProperty('name');
    expect(anonymous).not.toHaveProperty('email');

    const named = buildSubmission(MIDDLE, score, { name: 'Sam', email: 'sam@example.com', wantsSundayPause: true });
    expect(named.name).toBe('Sam');
    expect(named.email).toBe('sam@example.com');
    expect(named.sunday_pause).toBe('yes');
  });

  test('marks unanswered questions rather than dropping them', () => {
    const fields = buildSubmission({}, scoreCheckin({}), { name: '', email: '', wantsSundayPause: false });
    expect(fields.q02_drift).toBe('(no answer) (0)');
  });
});
