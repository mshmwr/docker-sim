import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../core/chapters';
import { judgeChoice, judgeOrderTap, judgePick } from '../core/judge';
import { SECTIONS } from '.';

describe('section data', () => {
  it('ids are unique', () => {
    expect(new Set(SECTIONS.map((s) => s.id)).size).toBe(SECTIONS.length);
  });

  for (const s of SECTIONS) {
    describe(s.id, () => {
      it('belongs to a known chapter and is numbered under it', () => {
        expect(CHAPTERS.some((c) => c.num === s.chapter)).toBe(true);
        expect(s.num.startsWith(`${s.chapter}-`)).toBe(true);
      });

      it('fits the 2-minute shape: 3-6 steps, 1-3 questions', () => {
        expect(s.steps.length).toBeGreaterThanOrEqual(3);
        expect(s.steps.length).toBeLessThanOrEqual(6);
        expect(s.questions.length).toBeGreaterThanOrEqual(1);
        expect(s.questions.length).toBeLessThanOrEqual(3);
      });

      it('every step has a scene and narration', () => {
        for (const st of s.steps) {
          expect(st.scene.length).toBeGreaterThan(0);
          expect(st.note.trim()).not.toBe('');
        }
      });

      s.questions.forEach((q, i) => {
        it(`question ${i + 1} (${q.type}) is answerable and explained`, () => {
          expect(q.prompt.trim()).not.toBe('');
          expect(q.explain.trim()).not.toBe('');
          if (q.type === 'choice') {
            expect(q.answer).toBeGreaterThanOrEqual(0);
            expect(q.answer).toBeLessThan(q.options.length);
            expect(judgeChoice(q, q.answer)).toBe(true);
          } else if (q.type === 'pick') {
            expect(q.answer.length).toBeGreaterThan(0);
            expect(q.answer.every((a) => a >= 0 && a < q.items.length)).toBe(true);
            expect(judgePick(q, q.answer)).toBe(true);
          } else {
            // Items render keyed by text, so duplicates would collide.
            expect(new Set(q.items).size).toBe(q.items.length);
            expect(q.items.length).toBeGreaterThanOrEqual(2);
          }
        });
      });
    });
  }
});

describe('judge', () => {
  const pick = { type: 'pick' as const, prompt: '', explain: '', items: ['a', 'b', 'c'], answer: [0, 2] };

  it('pick needs the exact set, in any order', () => {
    expect(judgePick(pick, [2, 0])).toBe(true);
    expect(judgePick(pick, [0])).toBe(false);
    expect(judgePick(pick, [0, 1, 2])).toBe(false);
  });

  it('order accepts only the next item', () => {
    expect(judgeOrderTap(0, 0)).toBe(true);
    expect(judgeOrderTap(1, 2)).toBe(false);
  });
});
