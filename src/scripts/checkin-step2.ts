import { STEP_TWO, resetReasons } from '../lib/checkin/journey';
import { CONTEXT_QUESTIONS, dimensionById } from '../lib/checkin/questions';
import { recommendNextSteps, scoreCheckin } from '../lib/checkin/scoring';
import { loadRecord, type CheckinRecord } from '../lib/checkin/store';

function setText(root: ParentNode, selector: string, text: string): void {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = text;
}

function situationLabel(record: CheckinRecord): string {
  const question = CONTEXT_QUESTIONS.find((candidate) => candidate.id === 'situation');
  if (question?.kind !== 'choice') return '';
  return question.options.find((option) => option.value === record.answers.situation)?.label ?? '';
}

function renderFraming(root: Document, record: CheckinRecord): void {
  const score = scoreCheckin(record.answers);
  const steps = recommendNextSteps(record.answers, score);
  const copy = STEP_TWO[steps.resetFit];
  setText(root, '[data-eyebrow]', copy.eyebrow.toLowerCase());
  setText(root, '[data-heading]', copy.heading);
  setText(root, '[data-body]', copy.body);

  const reasons = steps.resetFit === 'recommended' ? resetReasons(record.answers) : [];
  const list = root.querySelector<HTMLUListElement>('[data-reasons]');
  if (list && reasons.length > 0) {
    const items = reasons.map((reason) => Object.assign(document.createElement('li'), { textContent: `Because ${reason}.` }));
    list.replaceChildren(...items);
    list.hidden = false;
  }

  if (steps.prefersConversation || steps.resetFit === 'for-adults') {
    root.querySelector('[data-join]')?.classList.add('booking-first');
  }
}

function renderSummary(root: Document, record: CheckinRecord): void {
  const score = scoreCheckin(record.answers);
  const focus = recommendNextSteps(record.answers, score).focus;
  setText(root, '[data-sum-score]', `${score.total} out of ${score.max} · ${score.band.label}`);
  setText(root, '[data-sum-focus]', dimensionById(focus)?.name ?? focus);
  if (record.step1) setText(root, '[data-sum-step1]', record.step1.summary);
  const summary = root.querySelector<HTMLElement>('[data-summary]');
  if (summary) summary.hidden = false;
}

/** Fills the hidden context fields; they are only sent while the "include" box is ticked. */
function prepareForm(root: Document, record: CheckinRecord): void {
  const form = root.querySelector<HTMLFormElement>('[data-reset-form]');
  if (!form) return;
  const score = scoreCheckin(record.answers);
  const values: Readonly<Record<string, string>> = {
    checkin_score: `${score.total}/${score.max} (${score.band.label})`,
    checkin_focus: recommendNextSteps(record.answers, score).focus,
    checkin_situation: situationLabel(record),
    checkin_step1: record.step1?.summary ?? 'not done',
  };
  const contextInputs = [...form.querySelectorAll<HTMLInputElement>('[data-context]')];
  for (const input of contextInputs) input.value = values[input.name] ?? '';

  const include = form.querySelector<HTMLInputElement>('[data-include]');
  const sync = (): void => contextInputs.forEach((input) => (input.disabled = !include?.checked));
  include?.addEventListener('change', sync);
  // A successful send resets the form, which re-ticks the box; keep the fields in step with it.
  form.addEventListener('reset', () => setTimeout(sync));
  sync();
  const row = form.querySelector<HTMLElement>('[data-include-row]');
  if (row) row.hidden = false;

  const name = form.querySelector<HTMLInputElement>('input[name="name"]');
  const email = form.querySelector<HTMLInputElement>('input[name="email"]');
  if (name && !name.value) name.value = record.name;
  if (email && !email.value) email.value = record.email;
}

export function setUpStepTwo(root: Document): void {
  const record = loadRecord();
  if (!record) return;
  renderFraming(root, record);
  renderSummary(root, record);
  prepareForm(root, record);
}
