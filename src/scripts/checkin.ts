import { CONTEXT_QUESTIONS, SCORED_QUESTIONS } from '../lib/checkin/questions';
import { isComplete, scoreCheckin } from '../lib/checkin/scoring';
import { clearRecord, createRecord, loadRecord, saveRecord, type CheckinRecord } from '../lib/checkin/store';
import { buildSubmission, type Contact } from '../lib/checkin/submission';
import type { Answers } from '../lib/checkin/types';
import { renderResult } from './checkin-result';
import { sendFields } from './checkin-send';

const MESSAGES = {
  adult: "Please confirm you're 18 or over to continue.",
  choice: "Choose whichever is closest. There's no wrong answer.",
  email: "That email doesn't look quite right. Check it, or leave it blank.",
  pauseNeedsEmail: "Add your email if you'd like the Sunday Pause, or untick the box.",
  sending: 'Sending your answers to me…',
  sent: 'Your answers reached me. Thank you.',
  sentWithEmail: "Your answers reached me. Thank you. I'll be in touch personally.",
  failed: "Your result is all here, but your answers didn't reach me.",
  earlier: 'This is the result from your check-in earlier in this tab.',
  cleared: 'Cleared. Nothing from this check-in is stored in this browser any more.',
} as const;

const QUESTION_IDS = [...SCORED_QUESTIONS, ...CONTEXT_QUESTIONS].map((question) => question.id);

interface CheckinElements {
  readonly form: HTMLFormElement;
  readonly result: HTMLElement;
  readonly area: HTMLElement;
}

function readAnswers(form: HTMLFormElement): Answers {
  const data = new FormData(form);
  return Object.fromEntries(QUESTION_IDS.map((id) => [id, String(data.get(id) ?? '')]));
}

function readContact(form: HTMLFormElement): Contact {
  const data = new FormData(form);
  return {
    name: String(data.get('name') ?? '').trim(),
    email: String(data.get('email') ?? '').trim(),
    wantsSundayPause: data.get('sunday_pause') === 'yes',
  };
}

function setStatus(step: Element, message: string): void {
  const status = step.querySelector<HTMLElement>('.form-status');
  if (status) status.textContent = message;
}

/** Returns the message to show, or an empty string when the step can be left. */
function problemWith(step: HTMLFieldSetElement): string {
  if (step.dataset.kind === 'intro') {
    return step.querySelector<HTMLInputElement>('input[name="adult"]')?.checked ? '' : MESSAGES.adult;
  }
  if (step.dataset.required === 'choice') {
    return step.querySelector('input:checked') ? '' : MESSAGES.choice;
  }
  if (step.dataset.kind === 'contact') {
    const email = step.querySelector<HTMLInputElement>('input[name="email"]');
    const pause = step.querySelector<HTMLInputElement>('input[name="sunday_pause"]');
    if (email && !email.checkValidity()) return MESSAGES.email;
    if (pause?.checked && !email?.value.trim()) return MESSAGES.pauseNeedsEmail;
  }
  return '';
}

function markJourney(stage: 'checkin' | 'result'): void {
  const items = [...document.querySelectorAll<HTMLElement>('[data-journey] li')];
  const currentIndex = items.findIndex((item) => item.dataset.stage === stage);
  items.forEach((item, index) => {
    item.classList.toggle('done', index < currentIndex);
    if (index === currentIndex) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}

function retryButton(onRetry: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-quiet';
  button.textContent = 'Try sending again';
  button.addEventListener('click', onRetry, { once: true });
  return button;
}

async function deliver(form: HTMLFormElement, result: HTMLElement, record: CheckinRecord, contact: Contact): Promise<void> {
  const status = result.querySelector<HTMLElement>('[data-send-status]');
  if (!status) return;
  status.textContent = MESSAGES.sending;
  const honeypot = form.querySelector<HTMLInputElement>('input[name="_gotcha"]')?.value ?? '';
  const fields = { ...buildSubmission(record.answers, scoreCheckin(record.answers), contact), _gotcha: honeypot };
  const isSent = await sendFields(form.action, fields);
  if (isSent) {
    status.textContent = contact.email ? MESSAGES.sentWithEmail : MESSAGES.sent;
    return;
  }
  status.textContent = `${MESSAGES.failed} `;
  status.append(retryButton(() => void deliver(form, result, record, contact)));
}

export function setUpCheckin({ form, result, area }: CheckinElements): void {
  form.noValidate = true;
  const steps = [...form.querySelectorAll<HTMLFieldSetElement>('[data-step]')];
  const questionSteps = steps.filter((step) => step.dataset.kind === 'question');
  const count = form.querySelector<HTMLElement>('[data-count]');
  let current = 0;

  const show = (index: number, shouldFocus: boolean): void => {
    current = index;
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });
    const questionNumber = questionSteps.indexOf(steps[index]) + 1;
    const progress = steps[index].dataset.kind === 'contact' ? 1 : questionNumber / questionSteps.length;
    form.style.setProperty('--progress', `${Math.round(progress * 100)}%`);
    if (count) {
      count.textContent = questionNumber > 0 ? `Question ${questionNumber} of ${questionSteps.length}` : '';
    }
    if (shouldFocus) steps[index].focus();
  };

  const showResult = (record: CheckinRecord, note: string): void => {
    renderResult(result, record);
    area.hidden = true;
    result.hidden = false;
    markJourney('result');
    const status = result.querySelector<HTMLElement>('[data-send-status]');
    if (status) status.textContent = note;
    result.focus();
    result.scrollIntoView({ block: 'start' });
  };

  const restart = (message: string): void => {
    form.reset();
    result.hidden = true;
    area.hidden = false;
    markJourney('checkin');
    show(0, true);
    setStatus(steps[0], message);
  };

  const advance = (): void => {
    const step = steps[current];
    const problem = problemWith(step);
    setStatus(step, problem);
    if (problem) return;
    if (current < steps.length - 1) {
      show(current + 1, true);
      return;
    }
    const answers = readAnswers(form);
    if (!isComplete(answers)) {
      show(steps.findIndex((candidate) => problemWith(candidate) !== ''), true);
      return;
    }
    const contact = readContact(form);
    const record = createRecord(answers, contact.name, contact.email);
    saveRecord(record);
    showResult(record, '');
    void deliver(form, result, record, contact);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    advance();
  });
  for (const button of form.querySelectorAll('[data-next]')) button.addEventListener('click', advance);
  for (const button of form.querySelectorAll('[data-back]')) {
    button.addEventListener('click', () => show(Math.max(0, current - 1), true));
  }

  result.querySelector('[data-print]')?.addEventListener('click', () => window.print());
  result.querySelector('[data-restart]')?.addEventListener('click', () => {
    clearRecord();
    restart('');
  });
  result.querySelector('[data-forget]')?.addEventListener('click', () => {
    clearRecord();
    restart(MESSAGES.cleared);
  });

  const earlier = loadRecord();
  if (earlier && isComplete(earlier.answers)) {
    showResult(earlier, MESSAGES.earlier);
    return;
  }
  show(0, false);
}
