import type { Section } from '../core/types';

const COMPOSE = ['services:', '  web:', '    image: nginx:1.27', '  db:', '    image: postgres:latest', '    restart: always'];

export const tagsAndDigest: Section = {
  id: 'tags-and-digest',
  num: '3-5',
  chapter: 3,
  title: 'tag 會變，digest 不會',
  concept: '沒寫 tag 就是 latest，而 latest 不保證是最新、也會被換掉；正式環境要寫死版本，最嚴謹是釘 digest。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker pull nginx' },
            { text: 'Using default tag: latest', tone: 'focus', note: '沒寫 tag 就補 latest' },
            { text: '$ docker images nginx' },
            { text: 'nginx   latest   …', tone: 'dim' },
          ],
        },
      ],
      note: 'image 名稱後面冒號接的是 tag，用來分版本。沒寫 tag，Docker 自動當成 latest。',
    },
    {
      scene: [
        {
          kind: 'timeline',
          label: 'myapp:latest 指向誰',
          events: [
            { at: '1 月', text: '推了 1.4 版，貼上 latest' },
            { at: '2 月', text: 'A 機器 pull myapp:latest → 拿到 1.4', tone: 'good' },
            { at: '3 月', text: '推了 2.0 版，latest 被移過去' },
            { at: '3 月', text: 'B 機器 pull myapp:latest → 拿到 2.0', tone: 'bad' },
          ],
        },
      ],
      note: 'latest 只是一張「最後一次沒指定 tag 時貼上的」標籤，它會被移走。兩台機器在不同時間 pull，就可能拿到不同版本，部署在你不知情時默默變了。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '同一個 tag 被重新 push',
          nodes: [{ text: 'myapp:1.0' }, { text: '內容 A → 內容 B', tone: 'bad' }],
          links: [{ text: '指向' }],
        },
        {
          kind: 'flow',
          label: 'digest 是內容的指紋',
          nodes: [{ text: 'myapp@sha256:4f2a…' }, { text: '永遠是內容 A', tone: 'good' }],
          links: [{ text: '指向' }],
        },
      ],
      note: '連 1.0 這種版本號 tag，也可以被重新 push 換掉內容。digest 是從內容算出來的雜湊，內容一變 digest 就變，所以釘 digest 誰都騙不過。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '可重現性',
          head: ['寫法', '兩個月後再 pull'],
          rows: [
            { cells: ['nginx', '可能完全不同版本'], tone: 'bad' },
            { cells: ['nginx:1.27', '同一版，但 tag 理論上可被換掉'] },
            { cells: ['nginx@sha256:…', '保證位元組都相同'], tone: 'good' },
          ],
        },
      ],
      note: '正式環境至少寫死版本號；要最嚴謹就釘 digest。第六篇會再談簽章與信任。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '兩台機器相隔一個月，各自執行 docker pull nginx:latest。拿到的內容一定一樣嗎？',
      options: ['一定一樣，tag 一樣就是同一份', '不一定，latest 可能已經指向別的版本', '一定不一樣，latest 每天都會換'],
      answer: 1,
      explain: 'latest 只是一張會移動的標籤。這段期間上游推了新版，它就指向新內容了。要保證一樣得釘 digest。',
    },
    {
      type: 'pick',
      prompt: '這份 compose 檔要用在正式環境。哪一行最不適合？',
      items: COMPOSE,
      answer: [4],
      explain: 'postgres:latest 會隨上游更新而改變，某次重新部署可能就升了大版本，資料庫還不相容。改成 postgres:17 這類明確版本，或釘 digest。',
    },
  ],
  source: '教材 §3.7（latest 規則）、§22.8（釘 digest）',
};
