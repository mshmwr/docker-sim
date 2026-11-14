import { useEffect } from 'react';
import { Home } from './components/Home';
import { SectionPage } from './components/SectionPage';
import { useProgress } from './progress';
import { href, useRoute } from './router';
import { sectionById } from './sections';

export function App() {
  const route = useRoute();
  const { progress, markLearned, markSolved } = useProgress();
  const section = route.page === 'section' ? sectionById(route.id) : undefined;

  useEffect(() => {
    document.title = section ? `${section.num} ${section.title} · DockerSim` : 'DockerSim';
  }, [section]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  return (
    <>
      <nav className="topbar">
        <a className="logo" href={href({ page: 'home' })}>
          <span className="logo-mark">&gt;_</span> DockerSim
        </a>
      </nav>
      {route.page === 'home' ? (
        <Home progress={progress} />
      ) : section ? (
        <SectionPage
          key={section.id}
          section={section}
          mode={route.mode}
          progress={progress[section.id]}
          markLearned={markLearned}
          markSolved={markSolved}
        />
      ) : (
        <main className="page">
          <p>找不到這一節。</p>
          <a href={href({ page: 'home' })}>← 回目錄</a>
        </main>
      )}
    </>
  );
}
