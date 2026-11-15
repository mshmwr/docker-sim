import type { Section } from '../core/types';

const DOCKERFILE = [
  'FROM python:3.12-slim',
  'WORKDIR /app',
  'COPY requirements.txt .',
  'RUN pip install --no-cache-dir -r requirements.txt',
  'COPY . .',
  'ENV FLASK_APP=app.py',
  'EXPOSE 5000',
  'USER 1000:1000',
  'CMD ["python", "app.py"]',
];

const NOTES: Record<number, string> = {
  0: '基底 image，一定是第一行',
  1: '之後的指令都在 /app 裡做',
  3: 'build 時執行，結果存成一層',
  6: '只是宣告，不會開埠',
  7: '改用非 root 跑',
  8: '容器啟動時才執行',
};

export const dockerfileInstructions: Section = {
  id: 'dockerfile-instructions',
  num: '4-1',
  chapter: 4,
  title: '指令逐行讀',
  concept: 'Dockerfile 是一份照順序執行的食譜：RUN 在 build 時就跑完、結果存進 image；CMD 只是記下來，等容器啟動時才執行。',
  steps: [
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile',
          lines: DOCKERFILE.map((text, i) => ({
            text,
            note: NOTES[i],
            tone: i === 3 ? 'focus' : i === 8 ? 'good' : undefined,
          })),
        },
      ],
      note: '第 3 章用 commit 做 image 沒有紀錄、做不出第二次。Dockerfile 把每一步寫下來，任何人跑一行 docker build 都能建出同樣的 image。最容易混的是 RUN 和 CMD：RUN 在建 image 時執行，CMD 等到 docker run 啟動容器時才執行。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          label: '大小為示意',
          lines: [
            { text: '$ docker history myflask:1.0' },
            { text: 'CREATED BY                                SIZE', tone: 'dim' },
            { text: 'CMD ["python" "app.py"]                   0B', tone: 'dim', note: '只改設定' },
            { text: 'USER 1000:1000                            0B', tone: 'dim' },
            { text: 'EXPOSE map[5000/tcp:{}]                   0B', tone: 'dim' },
            { text: 'ENV FLASK_APP=app.py                      0B', tone: 'dim' },
            { text: 'COPY . . # buildkit                       8.2kB', tone: 'focus', note: '檔案層' },
            { text: 'RUN pip install --no-cache-dir -r …       5.9MB', tone: 'focus', note: '檔案層' },
            { text: 'COPY requirements.txt . # buildkit        12B', tone: 'focus', note: '檔案層' },
            { text: '…（python:3.12-slim 的層）', tone: 'dim' },
          ],
        },
      ],
      note: 'docker history 由新到舊列出每一層是哪一行做出來的。RUN、COPY 會改到檔案，各留下一層；ENV、EXPOSE、USER、CMD 只改 image 的設定，大小是 0B。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '只有 EXPOSE 5000，docker run 沒加 -p',
          nodes: [{ text: '瀏覽器' }, { text: '主機 :5000', tone: 'bad' }, { text: '容器 :5000', tone: 'dim' }],
          links: [{}, { text: '✗', tone: 'bad' }],
        },
        {
          kind: 'flow',
          label: 'docker run -p 5000:5000',
          nodes: [{ text: '瀏覽器' }, { text: '主機 :5000' }, { text: '容器 :5000', tone: 'good' }],
          links: [{}, { text: '-p 轉過去', tone: 'good' }],
        },
      ],
      note: 'EXPOSE 是寫給人看的說明：「這個程式會聽 5000 埠」。它不會替你開任何埠，主機要連進去還是得在 docker run 加 -p（1-6 講過）。',
    },
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile',
          lines: [
            { text: 'COPY app.tar.gz /app/', tone: 'good', note: '原封不動複製' },
            { text: 'ADD app.tar.gz /app/', tone: 'bad', note: '本機 tar 會被自動解開' },
            { text: 'ADD https://example.com/x.sh /tmp/', tone: 'bad', note: '還會去下載網址' },
            { text: '' },
            { text: 'MAINTAINER cat <cat@example.com>', tone: 'bad', note: '已棄用' },
            { text: 'LABEL maintainer="cat@example.com"', tone: 'good', note: '改用 LABEL' },
          ],
        },
      ],
      note: 'ADD 和 COPY 都能複製檔案，但 ADD 太聰明：遇到本機 tar 會自動解壓，給網址還會去下載。只是要複製，一律用 COPY；要下載就在 RUN 裡明確用 curl。標維護者也別再用 MAINTAINER，改用 LABEL。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: 'ONBUILD 只作用一代',
          nodes: [
            { text: 'team-base', note: 'ONBUILD COPY . /app' },
            { text: 'my-app', note: 'FROM team-base', tone: 'good' },
            { text: 'my-app-v2', note: 'FROM my-app', tone: 'dim' },
          ],
          links: [{ text: '觸發', tone: 'good' }, { text: '不再觸發', tone: 'bad' }],
        },
      ],
      note: 'ONBUILD 是埋在 image 裡的觸發器：建 team-base 時它不執行，等別人用 FROM team-base 建下一代時才執行。執行完就從新 image 清掉，所以再下一代（孫輩）不會再觸發。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '這幾行裡，哪一行的程式要等到 docker run 啟動容器時才會執行？',
      items: ['COPY requirements.txt .', 'RUN pip install -r requirements.txt', 'ENV FLASK_APP=app.py', 'CMD ["python", "app.py"]'],
      answer: [3],
      explain: 'CMD 在 build 時只是被記進 image 設定，容器啟動時才執行。RUN 在 build 時就跑完，結果存成一層；COPY 和 ENV 也都在 build 時處理完。',
    },
    {
      type: 'choice',
      prompt: 'Dockerfile 有 EXPOSE 5000。docker run -d myflask:1.0 沒加 -p，主機上連 localhost:5000 會怎樣？',
      options: ['連得到，EXPOSE 已經開好埠', '連不到，EXPOSE 只是宣告', '連得到，但只限 HTTP'],
      answer: 1,
      explain: 'EXPOSE 只記錄「這個容器會用 5000 埠」，不會把埠接到主機上。要從主機連，得 docker run -p 5000:5000。',
    },
    {
      type: 'choice',
      prompt: 'team-base 裡寫了 ONBUILD RUN npm ci。my-app 用 FROM team-base，my-app-v2 又用 FROM my-app。npm ci 會在哪一次 build 被觸發？',
      options: ['建 team-base 時', '建 my-app 時', '建 my-app 和 my-app-v2 時都會'],
      answer: 1,
      explain: 'ONBUILD 在自己那次 build 只是登記，等「直接拿它當基底」的下一代 build 時才執行。執行完觸發器就被清掉，孫輩 my-app-v2 不會再觸發。',
    },
  ],
  source: '教材 §4.1、§4.2、§4.4、§4.9（history 輸出為 BuildKit 格式，大小為示意）',
  verify: 'K-Line 練習第 1 章：docker build --platform linux/amd64 -t kline-lab:v1 . 後 docker history kline-lab:v1，最大的一層是 RUN pip install（約 437MB）。',
};
