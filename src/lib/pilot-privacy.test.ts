import { describe, expect, it } from 'vitest';
import { PILOT_END_ISO, RETENTION_MONTHS, WITHDRAW_DAYS, addMonths, formatLongDate } from './pilot-privacy';

describe('formatLongDate', () => {
  it('writes a date the British way, in full', () => {
    expect(formatLongDate('2027-01-31')).toBe('31 January 2027');
    expect(formatLongDate('2026-11-06')).toBe('6 November 2026');
  });

  it('does not shift the day with the time zone of the machine', () => {
    expect(formatLongDate('2027-01-01')).toBe('1 January 2027');
  });
});

describe('addMonths', () => {
  it('adds whole years', () => {
    expect(addMonths('2027-01-31', 12)).toBe('2028-01-31');
  });

  it('stops at the end of a shorter month instead of spilling into the next', () => {
    expect(addMonths('2027-01-31', 1)).toBe('2027-02-28');
    expect(addMonths('2027-08-31', 6)).toBe('2028-02-29');
  });

  it('crosses a year end', () => {
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
  });
});

describe('the pilot privacy note periods', () => {
  // These are the figures in the participants' welcome emails and in section 7 of the vault note.
  // If one of these fails, the page and the emails no longer say the same thing.
  it('has the pilot ending on 31 January 2027', () => {
    expect(formatLongDate(PILOT_END_ISO)).toBe('31 January 2027');
  });

  it('keeps data for 12 months, which runs to 31 January 2028', () => {
    expect(RETENTION_MONTHS).toBe(12);
    expect(formatLongDate(addMonths(PILOT_END_ISO, RETENTION_MONTHS))).toBe('31 January 2028');
  });

  it('promises a reply within 7 days', () => {
    expect(WITHDRAW_DAYS).toBe(7);
  });
});
