import { useCallback } from 'react';
import { CHAPTERS } from '../core/chapters';
import type { Section } from '../core/types';
import type { SectionProgress } from '../progress';
import { href, navigate } from '../router';
import { LearnMode } from './LearnMode';
import { PracticeMode } from './PracticeMode';

interface Props {
  section: Section;
  mode: 'learn' | 'practice';
  progress?: SectionProgress;
  markLearned: (id: string) => void;
  markSolved: (id: string, mistakes: number) => void;
}

export function SectionPage({ section, mode, progress, markLearned, markSolved }: Props) {
  const onFinished = useCallback(() => markLearned(section.id), [markLearned, section.id]);
  const onSolved = useCallback((m: number) => markSolved(section.id, m), [markSolved, section.id]);
  const ch = CHAPTERS.find((c) => c.num === section.chapter);

  return (
    <main className="page section-page">
      <a className="back" href={href({ page: 'home' })}>
        ← 回目錄
      </a>
      <header className="section-head">
        <div className="section-meta">
          {ch && (
            <span className="muted">
              {ch.part} · ch{ch.num} {ch.title}
            </span>
          )}
          {progress?.solved && (
            <span className="badge-solved">
              ✓ 練習完成{progress.bestMistakes !== undefined && ` · 最少答錯 ${progress.bestMistakes} 次`}
            </span>
          )}
        </div>
        <h1>
          <span className="num">{section.num}</span> {section.title}
        </h1>
        <div className="insight">
          <b>核心概念：</b>
          {section.concept}
        </div>
        <p className="source muted">出處：{section.source}</p>
      </header>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'learn'}
          className={mode === 'learn' ? 'on' : ''}
          onClick={() => navigate({ page: 'section', id: section.id, mode: 'learn' })}
        >
          ▶ 解說
        </button>
        <button
          role="tab"
          aria-selected={mode === 'practice'}
          className={mode === 'practice' ? 'on' : ''}
          onClick={() => navigate({ page: 'section', id: section.id, mode: 'practice' })}
        >
          ✋ 練習
        </button>
      </div>

      {mode === 'learn' ? (
        <LearnMode
          section={section}
          onFinished={onFinished}
          onPractice={() => navigate({ page: 'section', id: section.id, mode: 'practice' })}
        />
      ) : (
        <PracticeMode section={section} onSolved={onSolved} onWatch={() => navigate({ page: 'section', id: section.id, mode: 'learn' })} />
      )}
    </main>
  );
}
