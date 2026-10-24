import { DIMENSIONS } from './questions';
import type { Answers, DimensionId } from './types';

/**
 * The check-in journey keeps its state in sessionStorage only: it lives in
 * this browser tab, disappears when the tab closes, and never reaches the
 * server except through the forms the person chooses to submit.
 */
export const STORAGE_KEY = 'understory-checkin';
const RECORD_VERSION = 1;
const MAX_TEXT_LENGTH = 2000;

export interface Step1Record {
  readonly focus: DimensionId;
  readonly summary: string;
}

export interface CheckinRecord {
  readonly version: typeof RECORD_VERSION;
  readonly answers: Answers;
  readonly name: string;
  readonly email: string;
  readonly completedAt: string;
  readonly step1?: Step1Record;
}

function isDimensionId(value: unknown): value is DimensionId {
  return DIMENSIONS.some((dimension) => dimension.id === value);
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, MAX_TEXT_LENGTH) : '';
}

function parseAnswers(value: unknown): Answers | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value).filter(([, answer]) => typeof answer === 'string');
  return Object.fromEntries(entries.map(([id, answer]) => [id, cleanText(answer)]));
}

function parseStep1(value: unknown): Step1Record | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const { focus, summary } = value as Record<string, unknown>;
  return isDimensionId(focus) ? { focus, summary: cleanText(summary) } : undefined;
}

/** Turns stored JSON back into a record, or null if it is missing, old or malformed. */
export function parseRecord(raw: string | null): CheckinRecord | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const answers = parseAnswers(data.answers);
    if (data.version !== RECORD_VERSION || !answers) return null;
    return {
      version: RECORD_VERSION,
      answers,
      name: cleanText(data.name),
      email: cleanText(data.email),
      completedAt: cleanText(data.completedAt),
      step1: parseStep1(data.step1),
    };
  } catch {
    return null;
  }
}

export function createRecord(answers: Answers, name: string, email: string): CheckinRecord {
  return { version: RECORD_VERSION, answers, name, email, completedAt: new Date().toISOString() };
}

export function withStep1(record: CheckinRecord, step1: Step1Record): CheckinRecord {
  return { ...record, step1 };
}

export function loadRecord(): CheckinRecord | null {
  try {
    return parseRecord(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Returns false when storage is blocked, so callers can fall back to URL hints. */
export function saveRecord(record: CheckinRecord): boolean {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearRecord(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is blocked, so there is nothing stored to clear.
  }
}
