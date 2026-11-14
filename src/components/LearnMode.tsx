import { useEffect, useState } from 'react';
import type { Section } from '../core/types';
import { Scene } from './Scene';

interface Props {
  section: Section;
  onFinished: () => void;
  onPractice: () => void;
}

const SPEEDS = [0.5, 1, 2];
/** Steps carry narration to read, so auto-play is much slower than algo-sim's animation pace. */
const STEP_MS = 5000;

const isTyping = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
};

export function LearnMode({ section, onFinished, onPractice }: Props) {
  const steps = section.steps;
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const last = steps.length - 1;
  const step = steps[Math.min(k, last)];

  useEffect(() => {
    if (k >= last) {
      setPlaying(false);
      onFinished();
    }
  }, [k, last, onFinished]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setK((x) => Math.min(x + 1, last)), STEP_MS / speed);
    return () => window.clearTimeout(id);
  }, [playing, k, speed, last]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      if (e.key === 'ArrowRight') setK((x) => Math.min(x + 1, last));
      else if (e.key === 'ArrowLeft') setK((x) => Math.max(x - 1, 0));
      else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => (k >= last ? false : !p));
      } else return;
      if (e.key !== ' ') setPlaying(false);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [last, k]);

  const go = (x: number) => {
    setPlaying(false);
    setK(Math.max(0, Math.min(last, x)));
  };

  const finished = k >= last;

  return (
    <div className="stage">
      <Scene layers={step.scene} />
      <div className={`caption${finished ? ' caption-done' : ''}`}>
        <div className="caption-step">
          步驟 {k + 1} / {steps.length}
        </div>
        <div>{step.note}</div>
        {finished && <div className="caption-result">✓ {section.concept}</div>}
      </div>
      <div className="controls">
        <button className="icon-btn" onClick={() => go(0)} disabled={k === 0} title="第一步" aria-label="第一步">
          ⏮
        </button>
        <button className="icon-btn" onClick={() => go(k - 1)} disabled={k === 0} title="上一步" aria-label="上一步">
          ◀
        </button>
        <button
          className="icon-btn primary"
          onClick={() => (finished ? go(0) : setPlaying((p) => !p))}
          title={playing ? '暫停' : '播放'}
          aria-label={playing ? '暫停' : '播放'}
        >
          {playing ? '⏸' : finished ? '↺' : '▶'}
        </button>
        <button className="icon-btn" onClick={() => go(k + 1)} disabled={finished} title="下一步" aria-label="下一步">
          ▶
        </button>
        <button className="icon-btn" onClick={() => go(last)} disabled={finished} title="最後一步" aria-label="最後一步">
          ⏭
        </button>
        <input className="scrub" type="range" min={0} max={last} value={k} onChange={(e) => go(Number(e.target.value))} aria-label="步驟" />
        <label className="speed">
          速度
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
      </div>
      {finished && (
        <button className="btn primary wide" onClick={onPractice}>
          換你試試 →
        </button>
      )}
      <p className="kbd-hint">鍵盤：← → 切換步驟，空白鍵播放／暫停</p>
    </div>
  );
}
