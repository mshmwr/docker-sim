import type { Section } from '../core/types';

const SPLIT = [
  'FROM debian:bookworm',
  'RUN apt-get update',
  'RUN apt-get install -y --no-install-recommends openjdk-21-jre-headless',
  'RUN rm -rf /var/lib/apt/lists/*',
];

export const ghostFiles: Section = {
  id: 'ghost-files',
  num: '5-4',
  chapter: 5,
  title: '層的大小不會是負的',
  concept: '在後面的層刪檔案，image 不會變小，檔案還留在前面那層；裝和清要用 && 寫在同一個 RUN。',
  steps: [
    {
      scene: [{ kind: 'file', name: 'Dockerfile.fat', lines: SPLIT.map((text, i) => ({ text, tone: i === 3 ? 'focus' : undefined, note: i === 3 ? '想把套件清單清掉' : undefined })) }],
      note: '很直覺的寫法：裝完套件，再開一行把 apt 的套件清單刪掉，想讓 image 小一點。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: 'docker history demo:fat',
          items: [
            { text: 'RUN rm -rf /var/lib/apt/lists/*', tone: 'bad', note: '0B，只是標記「看不見」' },
            { text: 'RUN apt-get install … openjdk', note: '318MB' },
            { text: 'RUN apt-get update', tone: 'bad', note: '清單檔就寫在這層，還在' },
            { text: 'debian:bookworm 的層' },
          ],
        },
      ],
      note: '每一層提交後就凍結成唯讀層。後面那層的 rm 只是在上面蓋一張「看不見」的標記，前面那層的檔案一個 byte 都沒少。這些被蓋住卻還佔空間的檔案，就是幽靈檔案。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile.slim',
          lines: [
            { text: 'FROM debian:bookworm' },
            { text: 'RUN apt-get update && \\', tone: 'good' },
            { text: '    apt-get install -y --no-install-recommends openjdk-21-jre-headless && \\', tone: 'good' },
            { text: '    rm -rf /var/lib/apt/lists/*', tone: 'good', note: '同一層裡就刪掉' },
          ],
        },
      ],
      note: '把裝和清用 && 串在同一個 RUN。這一層提交的時候，清單檔早就刪掉了，根本不會被存進去。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: 'docker history demo:slim',
          items: [
            { text: 'RUN apt-get update && apt-get install … && rm …', tone: 'good', note: '只有一層，不含清單檔' },
            { text: 'debian:bookworm 的層' },
          ],
        },
      ],
      note: '這才是今天合併 RUN 的真正理由：在同一層內裝完就清。舊書說的「AUFS 最多 42 層」早已是歷史。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '機密也一樣',
          nodes: [
            { text: '第 3 層', note: 'COPY id_rsa /root/.ssh/', tone: 'bad' },
            { text: '第 4 層', note: 'RUN rm /root/.ssh/id_rsa' },
            { text: '拿到 image 的人', note: '解開第 3 層就讀得到', tone: 'bad' },
          ],
          links: [{}, { text: 'docker save', tone: 'bad' }],
        },
      ],
      note: '同樣的道理會洩漏機密：金鑰一旦被 COPY 進某一層，後面再怎麼刪都還在 image 裡。機密從一開始就不能進 image（22-2）。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '在 Dockerfile.fat 裡，被 rm -rf 刪掉的 /var/lib/apt/lists 檔案，實際還佔著哪一層的空間？',
      items: SPLIT,
      answer: [1],
      explain: '清單檔是 apt-get update 寫出來的，存在那一層。後面的 rm 層只是標記它們看不見，大小 0B，不會把前一層的空間拿回來。',
    },
    {
      type: 'choice',
      prompt: 'image 的第 3 層 COPY id_rsa，第 4 層 RUN rm id_rsa。拿到這個 image 的人讀得到金鑰嗎？',
      options: ['讀不到，已經刪掉了', '讀得到，解開第 3 層就有', '只有 root 讀得到'],
      answer: 1,
      explain: '刪除只發生在第 4 層，第 3 層的內容沒變。docker save 匯出後把第 3 層解開，金鑰就在裡面。',
    },
  ],
  source: '教材 §5.4 第一招、§5.6（指出清單檔實際在 apt-get update 那層，為教材外補充）',
  verify: 'K-Line 練習第 6 章 6-B：ENV TOKEN=abc123 進了 image 之後，docker history --no-trunc 查得到，同樣是「進了層就拿不出來」。',
};
