import { useCallback, useState } from 'react';

export interface SectionProgress {
  learned?: boolean;
  solved?: boolean;
  solves?: number;
  bestMistakes?: number;
}
export type ProgressMap = Record<string, SectionProgress>;
export type Status = 'notStarted' | 'learned' | 'solved';

const KEY = 'dockersim.progress.v1';

function load(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function save(p: ProgressMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: progress lives for this session only */
  }
}

export const statusOf = (p?: SectionProgress): Status => (p?.solved ? 'solved' : p?.learned ? 'learned' : 'notStarted');

export const STATUS_LABEL: Record<Status, string> = { notStarted: '未開始', learned: '看過解說', solved: '練習完成' };

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(load);

  const update = useCallback((id: string, fn: (p: SectionProgress) => SectionProgress) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: fn(prev[id] ?? {}) };
      save(next);
      return next;
    });
  }, []);

  const markLearned = useCallback((id: string) => update(id, (p) => (p.learned ? p : { ...p, learned: true })), [update]);

  const markSolved = useCallback(
    (id: string, mistakes: number) =>
      update(id, (p) => ({
        ...p,
        solved: true,
        solves: (p.solves ?? 0) + 1,
        bestMistakes: p.bestMistakes === undefined ? mistakes : Math.min(p.bestMistakes, mistakes),
      })),
    [update],
  );

  return { progress, markLearned, markSolved };
}
