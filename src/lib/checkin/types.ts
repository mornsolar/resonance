export type DimensionId = 'notice' | 'choose' | 'belong';

export type Points = 0 | 1 | 2;

export interface ScoredOption {
  readonly value: string;
  readonly label: string;
  readonly points: Points;
}

export interface ScoredQuestion {
  readonly id: string;
  readonly dimension: DimensionId;
  readonly prompt: string;
  readonly options: readonly ScoredOption[];
  /** Shown when this answer is one of the person's strongest. */
  readonly strength: string;
  /** Shown when this is the practice to work on first. */
  readonly action: string;
}

export interface ContextOption {
  readonly value: string;
  readonly label: string;
}

export interface ChoiceQuestion {
  readonly kind: 'choice';
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly ContextOption[];
}

export interface TextQuestion {
  readonly kind: 'text';
  readonly id: string;
  readonly prompt: string;
  readonly hint: string;
}

export type ContextQuestion = ChoiceQuestion | TextQuestion;

export interface Dimension {
  readonly id: DimensionId;
  readonly name: string;
  readonly summary: string;
}

/** Question id → chosen option value (or free text for Q15). */
export type Answers = Readonly<Record<string, string>>;

export interface DimensionScore {
  readonly id: DimensionId;
  readonly points: number;
  readonly max: number;
}

export type BandId = 'defaults' | 'some' | 'mostly';

export interface Band {
  readonly id: BandId;
  readonly label: string;
  readonly summary: string;
}

export interface CheckinScore {
  readonly total: number;
  readonly max: number;
  readonly band: Band;
  readonly dimensions: readonly DimensionScore[];
}

export interface Insight {
  readonly kind: 'strength' | 'opportunity' | 'context';
  readonly title: string;
  readonly body: string;
}

export type ResetFit = 'recommended' | 'optional' | 'for-adults';

export interface NextSteps {
  readonly focus: DimensionId;
  readonly resetFit: ResetFit;
  readonly prefersConversation: boolean;
}
