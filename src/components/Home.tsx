import { CHAPTERS, PARTS } from '../core/chapters';
import { SECTIONS, sectionsIn } from '../sections';
import { STATUS_LABEL, statusOf, type ProgressMap } from '../progress';
import { href } from '../router';

const PLANNED = CHAPTERS.reduce((n, c) => n + c.total, 0);

export function Home({ progress }: { progress: ProgressMap }) {
  const solvedCount = SECTIONS.filter((s) => progress[s.id]?.solved).length;

  return (
    <main className="page home">
      <section className="hero">
        <h1>
          DockerSim <span className="hero-sub">一節兩分鐘：看解說，再動手猜，把 Docker 概念練到會</span>
        </h1>
        <div className="hero-stats">
          <div>
            <b>{solvedCount}</b> / {SECTIONS.length} <span className="muted">練習完成</span>
          </div>
          <div>
            <b>{SECTIONS.length}</b> / {PLANNED} <span className="muted">已上線</span>
          </div>
        </div>
      </section>

      {PARTS.map((part) => (
        <section key={part}>
          <h2>{part}</h2>
          {CHAPTERS.filter((c) => c.part === part).map((c) => {
            const items = sectionsIn(c.num);
            return (
              <div key={c.num} className="group">
                <h3>
                  ch{c.num} {c.title}
                  <span className="muted">
                    {' '}
                    · {items.length} / {c.total} 節
                  </span>
                </h3>
                {items.length > 0 ? (
                  <ul className="plist">
                    {items.map((s) => {
                      const st = statusOf(progress[s.id]);
                      return (
                        <li key={s.id}>
                          <a href={href({ page: 'section', id: s.id, mode: 'learn' })} className="prow">
                            <span className={`status-dot s-${st}`} title={STATUS_LABEL[st]} />
                            <span className="num">{s.num}</span>
                            <span className="ptitle">{s.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="coming muted">即將推出</p>
                )}
              </div>
            );
          })}
        </section>
      ))}
      <footer className="footer muted">內容改寫自 Docker 課程教材；進度只存在這台瀏覽器。</footer>
    </main>
  );
}
