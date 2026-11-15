import type { Section } from '../core/types';

const DOCKERFILE = [
  'FROM node:20-alpine AS build',
  'WORKDIR /web',
  'COPY package*.json .',
  'RUN npm ci',
  'RUN npm install --no-save @rollup/rollup-linux-x64-musl',
  'COPY . .',
  'RUN npm run build',
];

export const buildxMultiplatform: Section = {
  id: 'buildx-multiplatform',
  num: '4-6',
  chapter: 4,
  title: '一次建多平台',
  concept: 'image 綁 CPU 架構：Apple Silicon 是 arm64，多數雲端主機是 amd64。用 buildx --platform 指定要建哪個，或一次建好幾個。',
  steps: [
    {
      scene: [
        {
          kind: 'flow',
          label: '在 Mac 上直接 build，推到 x86 主機跑',
          nodes: [
            { text: 'Mac', note: 'Apple Silicon（arm64）' },
            { text: 'image', note: 'linux/arm64' },
            { text: 'x86 雲端主機', note: 'linux/amd64', tone: 'bad' },
          ],
          links: [{ text: 'docker build' }, { text: 'push → pull → run', tone: 'bad' }],
        },
        { kind: 'terminal', lines: [{ text: 'exec /usr/local/bin/python: exec format error', tone: 'bad' }] },
      ],
      note: '沒指定平台時，image 預設跟建置機器同架構。arm64 的執行檔丟到 amd64 的 CPU 上跑不起來，錯誤就是 exec format error。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker build --platform linux/amd64 -t user/app:1.0 .', note: '只建 amd64' },
            { text: '$ docker buildx build \\' },
            { text: '    --platform linux/amd64,linux/arm64 \\', tone: 'focus', note: '一次建兩種' },
            { text: '    -t user/app:1.0 --push .' },
          ],
        },
      ],
      note: '--platform 指定目標架構。Mac 上建 amd64 是靠模擬執行，會比較慢，但跑得出來。要一次建多個平台就用 buildx，通常直接 --push 推上 registry。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: 'x86 主機 pull user/app:1.0',
          nodes: [{ text: 'user/app:1.0', note: '一個 tag，內含多平台清單' }, { text: 'linux/amd64 版', tone: 'good' }],
          links: [{ text: '自動挑' }],
        },
        {
          kind: 'flow',
          label: 'arm64 主機 pull 同一個 tag',
          nodes: [{ text: 'user/app:1.0' }, { text: 'linux/arm64 版', tone: 'good' }],
          links: [{ text: '自動挑' }],
        },
      ],
      note: '多平台的結果是一份 image index（manifest list）：同一個 tag 底下掛好幾個架構的版本。誰來 pull，就自動拿到符合自己 CPU 的那一個。',
    },
    {
      scene: [
        {
          kind: 'table',
          head: ['旗標', '成品去哪裡'],
          rows: [
            { cells: ['--push', '所有平台一起推上 registry'], tone: 'good' },
            { cells: ['--load（傳統 image store）', '載入本機，一次只能一個平台'] },
            { cells: ['--load（containerd image store）', '本機可以同時存多個平台'] },
          ],
        },
      ],
      note: '想在本機留一份來測，用 --load。傳統的 image store 只能放單一平台；Engine v29 新安裝預設的 containerd image store 可以放多平台。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '在 Apple Silicon Mac 上 docker build（沒加 --platform），推上 registry，再到一台沒裝模擬器的 x86 主機 docker run。結果？',
      options: ['正常執行', '架構不符，出現 exec format error', 'Docker 會自動轉成 amd64'],
      answer: 1,
      explain: 'image 預設跟建置的機器同架構，這裡是 arm64。x86 主機執行不了 arm64 的程式，就回 exec format error。要嘛建時加 --platform linux/amd64，要嘛用 buildx 建多平台。',
    },
    {
      type: 'pick',
      prompt: '這份 Dockerfile 在 x86 的 CI 上 build 成功，在 Apple Silicon（arm64）上卻失敗，訊息含 EBADPLATFORM。是哪一行？',
      items: DOCKERFILE,
      answer: [4],
      explain: '這一行寫死要裝只給 linux-x64 用的 rollup 套件。在 arm64 上建，CPU 不符，npm 就拒絕安裝。治標是加 --platform linux/amd64，治本是別寫死平台專用的套件。',
    },
  ],
  source: '教材 §4.8（--load 在 containerd image store 可載入多平台，為現行行為補充）',
  verify: 'K-Line 練習第 1 章：docker build --platform linux/amd64 成功；不加 --platform 在 Mac 上失敗，訊息含 EBADPLATFORM。',
};
