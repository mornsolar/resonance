import { describe, expect, test } from 'vitest';
import { createRecord, parseRecord, withStep1 } from './store';

describe('parseRecord', () => {
  test('round-trips a record created in this session', () => {
    const record = withStep1(createRecord({ cue: 'usually' }, 'Sam', 'sam@example.com'), {
      focus: 'choose',
      summary: 'Declared one pick-up',
    });
    expect(parseRecord(JSON.stringify(record))).toEqual(record);
  });

  test.each([null, '', 'not json', '[]', '{"version":2,"answers":{}}', '{"version":1,"answers":"cue"}'])(
    'rejects missing, malformed or outdated data: %s',
    (raw) => {
      expect(parseRecord(raw)).toBeNull();
    },
  );

  test('drops non-text answers and an unknown step-one focus', () => {
    const raw = JSON.stringify({
      version: 1,
      answers: { cue: 'usually', drift: 3 },
      step1: { focus: 'scroll-more', summary: 'x' },
    });
    const record = parseRecord(raw);
    expect(record?.answers).toEqual({ cue: 'usually' });
    expect(record?.step1).toBeUndefined();
    expect(record?.name).toBe('');
  });

  test('caps stored free text at a sensible length', () => {
    const raw = JSON.stringify({ version: 1, answers: { comment: 'a'.repeat(5000) } });
    expect(parseRecord(raw)?.answers.comment).toHaveLength(2000);
  });
});
