import { useEffect, useRef, useState } from 'react';
import { judgeChoice, judgeOrderTap, judgePick } from '../core/judge';
import type { ChoiceQuestion, OrderQuestion, PickQuestion, Question, Section } from '../core/types';
import { Scene } from './Scene';

interface Props {
  section: Section;
  onSolved: (mistakes: number) => void;
  onWatch: () => void;
}

interface AnswerProps<Q> {
  q: Q;
  solved: boolean;
  onWrong: () => void;
  onRight: () => void;
}

function Choice({ q, solved, onWrong, onRight }: AnswerProps<ChoiceQuestion>) {
  const [wrong, setWrong] = useState<number[]>([]);
  const pick = (i: number) => {
    if (judgeChoice(q, i)) onRight();
    else {
      setWrong((w) => [...w, i]);
      onWrong();
    }
  };
  return (
    <div className="options">
      {q.options.map((o, i) => (
        <button
          key={i}
          className={`option${wrong.includes(i) ? ' t-bad' : ''}${solved && i === q.answer ? ' t-good' : ''}`}
          disabled={solved || wrong.includes(i)}
          onClick={() => pick(i)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Pick({ q, solved, onWrong, onRight }: AnswerProps<PickQuestion>) {
  const [picked, setPicked] = useState<number[]>([]);
  const toggle = (i: number) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  const check = () => (judgePick(q, picked) ? onRight() : onWrong());
  return (
    <>
      <div className="pick-list">
        {q.items.map((it, i) => (
          <button
            key={i}
            className={`pick-item${picked.includes(i) ? ' on' : ''}${solved && q.answer.includes(i) ? ' t-good' : ''}`}
            disabled={solved}
            aria-pressed={picked.includes(i)}
            onClick={() => toggle(i)}
          >
            <code>{it}</code>
          </button>
        ))}
      </div>
      {!solved && (
        <button className="btn primary" onClick={check} disabled={picked.length === 0}>
          確認
        </button>
      )}
    </>
  );
}

function shuffled(n: number) {
  const a = [...Array(n).keys()];
  while (a.every((x, i) => x === i)) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  return a;
}

function Order({ q, solved, onWrong, onRight }: AnswerProps<OrderQuestion>) {
  const [display] = useState(() => shuffled(q.items.length));
  const [tapped, setTapped] = useState(0);
  const tap = (i: number) => {
    if (!judgeOrderTap(tapped, i)) return onWrong();
    setTapped(tapped + 1);
    if (tapped + 1 === q.items.length) onRight();
  };
  return (
    <>
      <ol className="order-done">
        {q.items.slice(0, tapped).map((it) => (
          <li key={it}>
            <code>{it}</code>
          </li>
        ))}
      </ol>
      {!solved && (
        <div className="pick-list">
          {display
            .filter((i) => i >= tapped)
            .map((i) => (
              <button key={i} className="pick-item" onClick={() => tap(i)}>
                <code>{q.items[i]}</code>
              </button>
            ))}
        </div>
      )}
    </>
  );
}

function Answer({ q, ...rest }: { q: Question } & Omit<AnswerProps<Question>, 'q'>) {
  if (q.type === 'choice') return <Choice q={q} {...rest} />;
  if (q.type === 'pick') return <Pick q={q} {...rest} />;
  return <Order q={q} {...rest} />;
}

export function PracticeMode({ section, onSolved, onWatch }: Props) {
  const qs = section.questions;
  const [qi, setQi] = useState(0);
  const [round, setRound] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(0);
  const reported = useRef(false);

  const done = qi >= qs.length;
  const q = qs[Math.min(qi, qs.length - 1)];

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onSolved(mistakes);
    }
  }, [done, mistakes, onSolved]);

  const next = () => {
    setQi((i) => i + 1);
    setSolved(false);
    setWrongFlash(0);
  };

  const restart = () => {
    setQi(0);
    setRound((r) => r + 1);
    setMistakes(0);
    setSolved(false);
    setWrongFlash(0);
    reported.current = false;
  };

  if (done) {
    return (
      <div className="stage">
        <div className="done-card">
          <div className="done-title">🎉 練習完成</div>
          <div className="muted">
            {qs.length} 題 · 答錯 {mistakes} 次{mistakes === 0 ? ' · 全對！' : ''}
          </div>
          {section.verify && <div className="verify">🖥 回到終端機驗證：{section.verify}</div>}
          <div className="done-actions">
            <button className="btn primary" onClick={restart}>
              ↺ 再練一次
            </button>
            <button className="btn" onClick={onWatch}>
              回看解說
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="practice-stats">
        <span>
          第 <b>{qi + 1}</b> / {qs.length} 題
        </span>
        <span className={mistakes ? 'bad' : ''}>
          答錯 <b>{mistakes}</b>
        </span>
      </div>
      {q.scene && <Scene layers={q.scene} />}
      <div className="prompt">{q.prompt}</div>
      <div className="answer">
        <Answer
          key={`${round}-${qi}`}
          q={q}
          solved={solved}
          onWrong={() => {
            setMistakes((m) => m + 1);
            setWrongFlash((w) => w + 1);
          }}
          onRight={() => setSolved(true)}
        />
      </div>
      {wrongFlash > 0 && !solved && (
        <div key={wrongFlash} className="feedback no shake" role="status">
          ✗ 不對，再想想。
        </div>
      )}
      {solved && (
        <>
          <div className="feedback ok" role="status">
            ✓ {q.explain}
          </div>
          <button className="btn primary wide" onClick={next}>
            {qi + 1 < qs.length ? '下一題 →' : '完成'}
          </button>
        </>
      )}
    </div>
  );
}
