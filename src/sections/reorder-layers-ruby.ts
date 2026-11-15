import type { Section } from '../core/types';

const WRONG = ['FROM ruby:3.3', 'WORKDIR /app', 'COPY . .', 'RUN bundle install', 'EXPOSE 9292', 'CMD ["rackup", "-E", "none"]'];
const RIGHT = ['FROM ruby:3.3', 'WORKDIR /app', 'COPY Gemfile Gemfile.lock ./', 'RUN bundle install', 'COPY . .', 'EXPOSE 9292', 'CMD ["rackup", "-E", "none"]'];

export const reorderLayersRuby: Section = {
  id: 'reorder-layers-ruby',
  num: '5-2',
  chapter: 5,
  title: '調換層順序：80 倍',
  concept: '同樣的指令換個順序，日常改程式後的 build 就從一分鐘變成不到一秒，連部署要傳的資料也跟著變少。',
  steps: [
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile（原本）',
          lines: WRONG.map((text, i) => ({ text, tone: i === 2 ? 'bad' : i === 3 ? 'focus' : undefined, note: i === 3 ? '很慢' : undefined })),
        },
      ],
      note: '4-4 的黃金守則，這次用 Ruby 專案實際量時間。原本一開頭就把整包程式碼複製進去，再裝相依套件。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: '改了 config.ru 之後重新 build',
          items: [
            { text: 'FROM ruby:3.3', tone: 'good', note: '快取' },
            { text: 'WORKDIR /app', tone: 'good', note: '快取' },
            { text: 'COPY . .', tone: 'bad', note: '程式碼變了 → 重做' },
            { text: 'RUN bundle install', tone: 'bad', note: '跟著重做，約一分鐘' },
          ],
        },
      ],
      note: '只改了一行程式，COPY . . 失效，下面的 bundle install 就被迫從頭再裝一次。每次小改都要等一分鐘。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile（調換後）',
          lines: RIGHT.map((text, i) => ({ text, tone: i === 2 || i === 4 ? 'good' : undefined, note: i === 2 ? '先只放相依清單' : i === 4 ? '程式碼最後才放' : undefined })),
        },
      ],
      note: '把「準備相依」和「放進程式碼」拆開：先只複製 Gemfile 和 Gemfile.lock、裝好套件，最後才複製全部程式碼。',
    },
    {
      scene: [
        {
          kind: 'size-bar',
          label: '改一行程式後重新 build 的時間（教材數字）',
          items: [
            { text: '原本的順序', value: 60, shown: '約 1 分鐘', tone: 'bad' },
            { text: '調換後', value: 0.75, shown: '不到 1 秒', tone: 'good' },
          ],
        },
      ],
      note: 'bundle install 那層命中快取，只重做最後的 COPY . .，快了將近 80 倍。成本只是調換兩行。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '部署新版本到已經跑著舊版的主機',
          nodes: [{ text: 'registry', note: '新版 image' }, { text: '正式主機', note: 'ruby、bundle 層早就有了', tone: 'good' }],
          links: [{ text: '只拉 COPY . . 那層', tone: 'good' }],
        },
      ],
      note: '順便也省了部署。正式主機上已經有下面那幾層，推新版時只要拉變動的最後一層，不用重抓整包套件。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '這份 Dockerfile 每改一行程式，bundle install 就重跑。是哪一行放錯位置？',
      items: WRONG,
      answer: [2],
      explain: 'COPY . . 太早出現。程式碼天天改，它一變，下面的 bundle install 就跟著失效。應該先只複製 Gemfile、Gemfile.lock，裝完套件再 COPY . .。',
    },
    {
      type: 'choice',
      prompt: '把層順序調好之後，除了 build 變快，為什麼部署也變快了？',
      options: ['image 被壓縮得更小', '主機已有下面那些層，只要拉變動的最後幾層', 'registry 會跳過沒改過的 image'],
      answer: 1,
      explain: 'image 是一疊層，pull 時只下載本機沒有的層。不常變的放下面，改程式時只有最上面的層換新，要傳的資料自然就少。',
    },
  ],
  source: '教材 §5.3 第一招（原範例的 ADD . /app 改寫為 COPY . .；80 倍為教材數字）',
  verify: 'K-Line 練習第 4 章 4-B：先 COPY frontend/package*.json 再 npm ci，修好 lockfile 後重新 build 成功。',
};
