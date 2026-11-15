import type { Section } from '../core/types';

const DOCKERFILE = [
  'FROM node:20-alpine AS build',
  'WORKDIR /web',
  'COPY package*.json .',
  'RUN npm ci',
  'COPY . .',
  'RUN npm run build',
  '',
  'FROM python:3.12-slim',
  'WORKDIR /app',
  'COPY requirements.txt .',
  'RUN pip install --no-cache-dir -r requirements.txt',
  'COPY backend/ .',
  'COPY --from=build /web/dist ./static',
  'CMD ["python", "app.py"]',
];

export const multiStage: Section = {
  id: 'multi-stage',
  num: '4-5',
  chapter: 4,
  title: '多階段建置',
  concept: '在一個階段裝工具、編譯，只把成品複製到另一個乾淨的階段；工具鏈不會進到最終 image。',
  steps: [
    {
      scene: [
        {
          kind: 'file',
          name: 'Dockerfile',
          lines: DOCKERFILE.map((text, i) => ({
            text,
            tone: i === 0 || i === 7 ? 'focus' : i === 12 ? 'good' : undefined,
            note: i === 0 ? '階段一：取名 build' : i === 7 ? '階段二：最終 image' : i === 12 ? '只拿成品' : undefined,
          })),
        },
      ],
      note: '一份 Dockerfile 可以有好幾個 FROM，每個 FROM 開始一個新階段。前端要用 node 編譯，但上線只需要編好的 dist；COPY --from=build 只把那個資料夾搬過來。',
    },
    {
      scene: [
        {
          kind: 'layers',
          label: '階段一 build：用完就丟',
          items: [
            { text: 'COPY . . / RUN npm run build', tone: 'dim', note: '產生 /web/dist' },
            { text: 'RUN npm ci', tone: 'dim', note: 'node_modules，數百 MB' },
            { text: 'node:20-alpine 的層', tone: 'dim' },
          ],
        },
        {
          kind: 'layers',
          label: '階段二：最終 image',
          items: [
            { text: 'COPY --from=build /web/dist ./static', tone: 'good', note: '只有成品，約 1MB' },
            { text: 'COPY backend/ .', tone: 'good' },
            { text: 'RUN pip install …', tone: 'good' },
            { text: 'python:3.12-slim 的層', tone: 'good' },
          ],
        },
      ],
      note: '最終 image 只由最後一個階段的層組成。node、npm 和數百 MB 的 node_modules 都留在階段一，不會被推上 registry，也不會變成攻擊面。',
    },
    {
      scene: [
        {
          kind: 'table',
          label: '最終階段的基底，由肥到瘦',
          head: ['基底', '特色', '注意'],
          rows: [
            { cells: ['python:3.12', '工具齊全', '很大，不建議當最終階段'], tone: 'bad' },
            { cells: ['python:3.12-slim', '去掉大部分非必要套件', '日常首選'], tone: 'good' },
            { cells: ['python:3.12-alpine', '最小', '用 musl 不是 glibc，有些 C 擴充套件會出問題'] },
          ],
        },
      ],
      note: '最終階段挑哪個基底，直接決定 image 大小。原則是在能正常跑的前提下挑越小的；alpine 要測過再用。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker history app --format "{{.Size}}  {{.CreatedBy}}"' },
            { text: '0B      CMD ["python" "app.py"]', tone: 'dim' },
            { text: '1.3MB   COPY /web/dist ./static # buildkit', tone: 'good', note: '從階段一搬來的' },
            { text: '…       COPY backend/ . # buildkit' },
            { text: '…       RUN pip install …' },
            { text: '（沒有 npm ci、npm run build）', tone: 'good' },
          ],
        },
      ],
      note: '用 docker history 驗收：最終 image 裡找不到 npm ci 這類階段一的指令，只剩 COPY --from 搬來的那一層。',
    },
  ],
  questions: [
    {
      type: 'pick',
      prompt: '用這一節的 Dockerfile 建好 image。哪些東西會在最終 image 裡？（選出全部）',
      items: ['node:20-alpine 的層', 'npm ci 裝的 node_modules', 'python:3.12-slim 的層', 'pip install 裝的套件', '從階段一複製來的 dist'],
      answer: [2, 3, 4],
      explain: '最終 image 只有最後一個 FROM 之後的層：python:3.12-slim 基底、pip install、後端程式和 COPY --from 搬來的 dist。node 的層和 node_modules 都留在階段一。',
    },
    {
      type: 'choice',
      prompt: 'Dockerfile 裡沒有任何階段叫 nginx，卻寫了 COPY --from=nginx:alpine /etc/nginx/nginx.conf .。可以 build 嗎？',
      options: ['可以，--from 也能直接指定一個現成的 image', '不行，--from 只能指前面的階段', '不行，要先 FROM nginx:alpine'],
      answer: 0,
      explain: '--from 除了接階段名稱，也能接 image 名稱。Docker 會把 nginx:alpine 拉下來，只取出那一個檔案，不用拿整個 image 當基底。',
    },
  ],
  source: '教材 §4.6（範例改為前端建置＋Python 後端，對照 K-Line 的結構）',
  verify: 'K-Line 練習第 1 章參考答案 3：docker history kline-lab:v1 看不到 npm ci，只剩約 1.3MB 的 COPY --from=frontend-build。',
};
