import type { Section } from '../core/types';

export const buildContextDockerignore: Section = {
  id: 'build-context-dockerignore',
  num: '4-3',
  chapter: 4,
  title: 'build context 與 .dockerignore',
  concept: 'docker build . 會把整個資料夾送去建置；.dockerignore 決定哪些不送，.env 和 .git 一定要排除。',
  steps: [
    {
      scene: [
        {
          kind: 'flow',
          label: 'docker build -t app .',
          nodes: [
            { text: '專案資料夾', note: '.git 1GB、node_modules、.env…', tone: 'bad' },
            { text: 'dockerd / BuildKit' },
          ],
          links: [{ text: '整包送過去', tone: 'bad' }],
        },
      ],
      note: '最後那個 . 就是 build context。CLI 和 daemon 是分開的（1-5），所以 build 時要先把這整個資料夾送給 daemon，裡面的東西才能被 COPY。沒排除的話，連 1GB 的 .git 也一起送。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker build -t app .' },
            { text: '=> [internal] load build context', tone: 'dim' },
            { text: '=> => transferring context: 1.02GB', tone: 'bad', note: '還沒開始 build 就先等' },
          ],
        },
        {
          kind: 'size-bar',
          label: '送出的 context（大小為示意）',
          items: [
            { text: '沒有 .dockerignore', value: 1020, shown: '1.02 GB', tone: 'bad' },
            { text: '排除 .git、node_modules 後', value: 3, shown: '3 MB', tone: 'good' },
          ],
        },
      ],
      note: 'BuildKit 的輸出會寫 transferring context，後面就是送了多少。教材裡的 Sending build context to Docker daemon 是舊版 builder 的寫法。這一步跟快取無關，每次 build 都要做。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: '.dockerignore',
          lines: [
            { text: '.git', note: '版控歷史，build 用不到' },
            { text: 'node_modules', note: '容器裡會自己裝' },
            { text: '.env', tone: 'bad', note: '機密，一定要排除' },
            { text: '*.md', note: '排除所有 md' },
            { text: '!README.md', tone: 'good', note: '例外：README 留著' },
          ],
        },
      ],
      note: '寫法跟 .gitignore 很像：一行一條規則，* 是萬用字元，! 是例外。.env 常放密碼，送進 context 再被 COPY . . 帶進 image，拿到 image 的人都讀得到。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: '.dockerignore（順序錯）',
          lines: [
            { text: '!README.md', tone: 'dim', note: '先救回 README' },
            { text: '*.md', tone: 'bad', note: '又把它排除掉' },
          ],
        },
        {
          kind: 'terminal',
          lines: [{ text: '$ docker build -t app .' }, { text: 'ERROR: failed to compute cache key: "/README.md": not found', tone: 'bad' }],
        },
      ],
      note: '規則由上往下比對，最後一條符合的說了算。! 例外要寫在它要救的那條規則後面，否則被後面的 *.md 又排除，COPY README.md 就找不到檔案。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '用下面這份 .dockerignore，Dockerfile 的 COPY README.md / 失敗，說 "/README.md": not found。是哪一行造成的？',
      items: ['.git', 'node_modules', '.env', '*.md'],
      answer: [3],
      explain: '*.md 把所有 md 檔排除了，README.md 根本沒被送進 context。要在它後面加一行 !README.md 把它救回來。',
    },
    {
      type: 'choice',
      prompt: '.gitignore 有寫 .env，.dockerignore 沒寫。Dockerfile 用 COPY . .，.env 會進到 image 嗎？',
      options: ['不會，Docker 會參考 .gitignore', '會，Docker 只讀 .dockerignore', '只有 build 失敗時才會'],
      answer: 1,
      explain: 'Docker 不讀 .gitignore。.env 沒寫在 .dockerignore，就會被送進 context，再被 COPY . . 複製進 image。',
    },
  ],
  source: '教材 §4.5、§4.7、§5.3 第二招（輸出改為現行 BuildKit 格式；context 大小為示意）',
  verify: 'K-Line 練習第 3 章：拿掉 .dockerignore 的 !README.md 再 build，會失敗在 "/README.md": not found；6-C 用 COPY 把 .env 帶進 image。',
};
