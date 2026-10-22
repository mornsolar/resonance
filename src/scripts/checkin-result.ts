import { buildInsights } from '../lib/checkin/insights';
import { STEP_ONE, STEP_TWO } from '../lib/checkin/journey';
import { ratioOf, recommendNextSteps, scoreCheckin } from '../lib/checkin/scoring';
import type { CheckinRecord } from '../lib/checkin/store';
import type { CheckinScore, DimensionId, Insight, NextSteps } from '../lib/checkin/types';

const PERCENT = 100;

function setText(root: ParentNode, selector: string, text: string): void {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = text;
}

/** Waits a frame so bars and the gauge animate from empty (CSS skips this under reduced motion). */
function nextFrame(callback: () => void): void {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}

function renderScore(result: HTMLElement, score: CheckinScore): void {
  setText(result, '[data-total]', String(score.total));
  setText(result, '[data-band-label]', score.band.label);
  setText(result, '[data-band-summary]', score.band.summary);
  setText(result, '[data-gauge-label]', `Your score: ${score.total} out of ${score.max}, ${score.band.label}`);
  const fill = result.querySelector<SVGPathElement>('[data-gauge-fill]');
  const share = Math.round((score.total / score.max) * PERCENT);
  nextFrame(() => fill?.setAttribute('stroke-dasharray', `${share} ${PERCENT}`));
}

function renderDimensions(result: HTMLElement, score: CheckinScore, focus: DimensionId): void {
  for (const dimension of score.dimensions) {
    const row = result.querySelector<HTMLElement>(`[data-dimension-row="${dimension.id}"]`);
    if (!row) continue;
    setText(row, '[data-dimension-value]', `${dimension.points} of ${dimension.max}`);
    row.classList.toggle('is-focus', dimension.id === focus);
    const bar = row.querySelector<HTMLElement>('.bar > span');
    nextFrame(() => bar?.style.setProperty('--fill', `${Math.round(ratioOf(dimension) * PERCENT)}%`));
  }
}

function renderInsights(result: HTMLElement, insights: readonly Insight[]): void {
  const cards = [...result.querySelectorAll<HTMLElement>('[data-insight]')];
  cards.forEach((card, index) => {
    const insight = insights[index];
    if (!insight) return;
    card.dataset.kind = insight.kind;
    setText(card, 'h3', insight.title);
    setText(card, 'p', insight.body);
  });
}

function renderNextSteps(result: HTMLElement, steps: NextSteps): void {
  const stepOne = STEP_ONE[steps.focus];
  setText(result, '[data-step1-title]', stepOne.title);
  setText(result, '[data-step1-lede]', stepOne.lede);
  const link = result.querySelector<HTMLAnchorElement>('[data-step1-link]');
  if (link) {
    const target = new URL(link.href);
    target.searchParams.set('focus', steps.focus);
    link.href = target.href;
  }

  const stepTwo = STEP_TWO[steps.resetFit];
  setText(result, '[data-step2-eyebrow]', stepTwo.eyebrow.toLowerCase());
  setText(result, '[data-step2-heading]', stepTwo.heading);
  setText(result, '[data-step2-body]', stepTwo.body);
  result.querySelector('[data-step2-card]')?.classList.toggle('is-suggested', steps.resetFit === 'recommended');
}

export function renderResult(result: HTMLElement, record: CheckinRecord): void {
  const score = scoreCheckin(record.answers);
  const steps = recommendNextSteps(record.answers, score);
  renderScore(result, score);
  renderDimensions(result, score, steps.focus);
  renderInsights(result, buildInsights(record.answers, score));
  renderNextSteps(result, steps);
}
