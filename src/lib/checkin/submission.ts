import { CONTEXT_QUESTIONS, SCORED_QUESTIONS } from './questions';
import { pointsFor, weakestDimension } from './scoring';
import type { Answers, CheckinScore } from './types';

export const FORM_NAME = 'phone-check-in';

export interface Contact {
  readonly name: string;
  readonly email: string;
  readonly wantsSundayPause: boolean;
}

function fieldName(index: number, id: string): string {
  return `q${String(index + 1).padStart(2, '0')}_${id}`;
}

function scoredFields(answers: Answers): Record<string, string> {
  return Object.fromEntries(
    SCORED_QUESTIONS.map((question, index) => {
      const label = question.options.find((option) => option.value === answers[question.id])?.label ?? '(no answer)';
      return [fieldName(index, question.id), `${label} (${pointsFor(question, answers[question.id])})`];
    }),
  );
}

function contextFields(answers: Answers): Record<string, string> {
  return Object.fromEntries(
    CONTEXT_QUESTIONS.map((question, index) => {
      const raw = answers[question.id] ?? '';
      const value =
        question.kind === 'choice' ? (question.options.find((option) => option.value === raw)?.label ?? '') : raw.trim();
      return [fieldName(SCORED_QUESTIONS.length + index, question.id), value];
    }),
  );
}

/**
 * Flat, human-readable fields for the Formspree inbox: one email per check-in,
 * readable without a spreadsheet. Name and email are only included when given.
 */
export function buildSubmission(answers: Answers, score: CheckinScore, contact: Contact): Record<string, string> {
  const dimensionFields = Object.fromEntries(
    score.dimensions.map((dimension) => [`score_${dimension.id}`, `${dimension.points}/${dimension.max}`]),
  );
  const contactFields = {
    ...(contact.name.trim() ? { name: contact.name.trim() } : {}),
    ...(contact.email.trim() ? { email: contact.email.trim() } : {}),
  };
  return {
    _subject: `Phone check-in: ${score.total}/${score.max}, ${score.band.label}`,
    form: FORM_NAME,
    score_total: `${score.total}/${score.max}`,
    score_band: score.band.label,
    ...dimensionFields,
    focus: weakestDimension(score),
    ...scoredFields(answers),
    ...contextFields(answers),
    ...contactFields,
    sunday_pause: contact.wantsSundayPause ? 'yes' : 'no',
    adult_confirmed: 'yes',
  };
}
