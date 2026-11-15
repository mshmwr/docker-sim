/** Visual emphasis shared by every scene primitive. */
export type Tone = 'good' | 'bad' | 'focus' | 'dim';

export interface Line {
  text: string;
  tone?: Tone;
  note?: string;
}

/** One block of a scene. A step's scene is a vertical stack of these. */
export type Layer =
  | { kind: 'states'; label?: string; states: string[]; current: string | null }
  | { kind: 'timeline'; label?: string; events: { at: string; text: string; tone?: Tone }[] }
  | { kind: 'terminal'; label?: string; lines: Line[] }
  | { kind: 'file'; label?: string; name: string; lines: Line[] }
  | { kind: 'layers'; label?: string; items: Line[] }
  /** Nodes joined by arrows; `links[i]` labels the arrow from `nodes[i]` to `nodes[i + 1]`. */
  | { kind: 'flow'; label?: string; nodes: Line[]; links?: { text?: string; tone?: Tone }[] }
  | { kind: 'table'; label?: string; head: string[]; rows: { cells: string[]; tone?: Tone }[] }
  /** Horizontal bars sized by `value` relative to the largest; `shown` is the printed size. */
  | { kind: 'size-bar'; label?: string; items: { text: string; value: number; shown: string; tone?: Tone }[] };

export interface Step {
  scene: Layer[];
  note: string;
}

interface QuestionBase {
  prompt: string;
  scene?: Layer[];
  explain: string;
}

/** Single answer out of several options (prediction or plain choice). */
export interface ChoiceQuestion extends QuestionBase {
  type: 'choice';
  options: string[];
  answer: number;
}

/** Select the exact set of correct items (lines of a file, layers to rebuild…). */
export interface PickQuestion extends QuestionBase {
  type: 'pick';
  items: string[];
  answer: number[];
}

/** Tap the items in the right order; `items` is listed in the correct order and shuffled on screen. */
export interface OrderQuestion extends QuestionBase {
  type: 'order';
  items: string[];
}

export type Question = ChoiceQuestion | PickQuestion | OrderQuestion;

export interface Section {
  id: string;
  /** Display number, e.g. `4-4` = chapter 4, section 4. */
  num: string;
  chapter: number;
  title: string;
  concept: string;
  steps: Step[];
  questions: Question[];
  /** Where in the course material this comes from. */
  source: string;
  /** The hands-on K-Line practice step that verifies this concept for real, if any. */
  verify?: string;
}

export interface Chapter {
  num: number;
  part: string;
  title: string;
  total: number;
}
