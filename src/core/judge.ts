import type { ChoiceQuestion, PickQuestion } from './types';

export const judgeChoice = (q: ChoiceQuestion, picked: number) => picked === q.answer;

export function judgePick(q: PickQuestion, picked: number[]) {
  const want = new Set(q.answer);
  return picked.length === want.size && picked.every((i) => want.has(i));
}

/** Order items are stored in the correct order, so after `tapped` correct taps the next right item is index `tapped`. */
export const judgeOrderTap = (tapped: number, item: number) => item === tapped;
