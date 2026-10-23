import { STEP_ONE } from '../lib/checkin/journey';
import { DIMENSIONS } from '../lib/checkin/questions';
import { scoreCheckin, weakestDimension } from '../lib/checkin/scoring';
import { loadRecord, saveRecord, withStep1 } from '../lib/checkin/store';
import type { DimensionId } from '../lib/checkin/types';

const MESSAGES = {
  choice: "Choose whichever is closest for each question. There's no wrong answer.",
  text: 'Write a few words first. Nobody else sees it.',
  copied: 'Copied. Paste it wherever you usually message them.',
  copyFailed: "Couldn't copy automatically. Select the message and copy it yourself.",
} as const;

interface Outcome {
  readonly summary: string;
}

type Completer = (form: HTMLFormElement, after: HTMLElement) => Outcome | string;

function isDimensionId(value: string | null | undefined): value is DimensionId {
  return DIMENSIONS.some((dimension) => dimension.id === value);
}

function initialFocus(): DimensionId {
  const fromUrl = new URLSearchParams(window.location.search).get('focus');
  if (isDimensionId(fromUrl)) return fromUrl;
  const record = loadRecord();
  return record ? weakestDimension(scoreCheckin(record.answers)) : 'notice';
}

function checkedLabel(form: HTMLFormElement, name: string): string {
  const input = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return input?.closest('label')?.textContent?.trim() ?? '';
}

function field(form: HTMLFormElement, name: string): string {
  return String(new FormData(form).get(name) ?? '').trim();
}

function setText(root: ParentNode, selector: string, text: string): void {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = text;
}

function completeNotice(form: HTMLFormElement, after: HTMLElement): Outcome | string {
  const names = ['trigger', 'outcome', 'feeling'];
  const labels = names.map((name) => checkedLabel(form, name));
  if (labels.some((label) => !label)) return MESSAGES.choice;
  const items = labels.map((label) => Object.assign(document.createElement('li'), { textContent: `· ${label}` }));
  after.querySelector('[data-noted]')?.replaceChildren(...items);
  const trigger = new FormData(form).get('trigger');
  for (const paragraph of after.querySelectorAll<HTMLElement>('[data-reflection]')) {
    paragraph.hidden = paragraph.dataset.reflection !== trigger;
  }
  return { summary: `Noticed: ${labels[0]}; ended up: ${labels[1]}; felt: ${labels[2]}` };
}

function completeChoose(form: HTMLFormElement, after: HTMLElement): Outcome | string {
  const purpose = field(form, 'purpose');
  const apps = field(form, 'apps');
  const minutes = field(form, 'minutes');
  if (!purpose) return MESSAGES.text;
  if (!minutes) return MESSAGES.choice;
  const using = apps ? `, using ${apps}` : '';
  setText(after, '[data-declaration]', `I'm picking up my phone to ${purpose}${using}, for ${minutes} minutes. Then it goes down for ${minutes} minutes.`);
  return { summary: `Declared: ${purpose}${using}, for ${minutes} minutes` };
}

function completeBelong(form: HTMLFormElement, after: HTMLElement): Outcome | string {
  const sentence = field(form, 'sentence').replace(/[.!\s]+$/, '');
  const person = field(form, 'person');
  if (!sentence) return MESSAGES.text;
  const greeting = person ? `Hi ${person}, ` : '';
  setText(after, '[data-sentence]', `I'm someone who uses my phone to ${sentence}.`);
  setText(
    after,
    '[data-message]',
    `${greeting}I'm trying something small: I'd like to be someone who uses my phone to ${sentence}. Could you ask me how it's going next week?`,
  );
  // The other person's name stays on the page; only the fact of telling someone is kept.
  return { summary: `Wrote: "I'm someone who uses my phone to ${sentence}"${person ? '; planning to tell someone' : ''}` };
}

const COMPLETERS: Readonly<Record<DimensionId, Completer>> = {
  notice: completeNotice,
  choose: completeChoose,
  belong: completeBelong,
};

async function copyMessage(after: HTMLElement): Promise<void> {
  const message = after.querySelector<HTMLElement>('[data-message]')?.textContent ?? '';
  try {
    await navigator.clipboard.writeText(message);
    setText(after, '[data-copy-status]', MESSAGES.copied);
  } catch {
    setText(after, '[data-copy-status]', MESSAGES.copyFailed);
  }
}

function finishExercise(form: HTMLFormElement, after: HTMLElement, focus: DimensionId): void {
  const outcome = COMPLETERS[focus](form, after);
  const status = form.querySelector<HTMLElement>('.form-status');
  if (typeof outcome === 'string') {
    if (status) status.textContent = outcome;
    return;
  }
  if (status) status.textContent = '';
  for (const block of after.querySelectorAll<HTMLElement>('[data-after-for]')) {
    block.hidden = block.dataset.afterFor !== focus;
  }
  form.hidden = true;
  after.hidden = false;
  after.focus();
  const record = loadRecord();
  if (record) saveRecord(withStep1(record, { focus, summary: outcome.summary }));
}

export function setUpStepOne(root: Document): void {
  const forms = [...root.querySelectorAll<HTMLFormElement>('[data-exercise]')];
  const after = root.querySelector<HTMLElement>('[data-after]');
  const why = root.querySelector<HTMLElement>('[data-why]');
  if (!after || forms.length === 0) return;
  const suggested = initialFocus();

  const showExercise = (focus: DimensionId): void => {
    forms.forEach((form) => {
      form.hidden = form.dataset.exercise !== focus;
    });
    after.hidden = true;
    setText(root, '[data-title]', STEP_ONE[focus].title);
    setText(root, '[data-lede]', STEP_ONE[focus].lede);
    if (why) {
      why.textContent = STEP_ONE[focus].why;
      why.hidden = !loadRecord() || focus !== suggested;
    }
  };

  for (const form of forms) {
    form.noValidate = true;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const focus = form.dataset.exercise;
      if (isDimensionId(focus)) finishExercise(form, after, focus);
    });
  }

  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-switch]')) {
    button.addEventListener('click', () => {
      const focus = button.dataset.switch;
      if (!isDimensionId(focus)) return;
      showExercise(focus);
      root.querySelector<HTMLElement>(`[data-exercise="${focus}"] input`)?.focus();
    });
  }

  after.querySelector('[data-copy]')?.addEventListener('click', () => void copyMessage(after));
  showExercise(suggested);
}
