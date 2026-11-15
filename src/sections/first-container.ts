import type { Section } from '../core/types';

export const firstContainer: Section = {
  id: 'first-container',
  num: '1-6',
  chapter: 1,
  title: '第一個容器與 -p',
  concept: 'docker run 會先找本機的 image，沒有就自動 pull；要加 -p 主機埠:容器埠，外面才連得到容器。',
  steps: [
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run hello-world' },
            { text: "Unable to find image 'hello-world:latest' locally", tone: 'focus', note: '本機沒有' },
            { text: 'latest: Pulling from library/hello-world', tone: 'focus', note: '自動 pull' },
            { text: 'Hello from Docker!', tone: 'good', note: 'run 起來' },
          ],
        },
      ],
      note: '一行 docker run 就把 registry → pull → image → run → container 整條鏈走了一遍。hello-world 印完字主程式就結束，容器也跟著停（3-4 會細講）。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          lines: [
            { text: '$ docker run -d --name web -p 8080:80 nginx' },
            { text: '$ docker ps' },
            { text: 'IMAGE   STATUS          PORTS                  NAMES', tone: 'dim' },
            { text: 'nginx   Up 30 seconds   0.0.0.0:8080->80/tcp   web', tone: 'good' },
          ],
        },
      ],
      note: '-d 丟到背景跑、--name 取個好記的名字、-p 8080:80 把主機的 8080 接到容器的 80。打開瀏覽器連 localhost:8080 就看到 nginx 歡迎頁。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '有 -p 8080:80',
          nodes: [{ text: '瀏覽器' }, { text: '主機 :8080' }, { text: '容器 :80', tone: 'good' }],
          links: [{}, { text: '-p 轉過去', tone: 'good' }],
        },
        {
          kind: 'flow',
          label: '沒有 -p',
          nodes: [{ text: '瀏覽器' }, { text: '主機 :80', tone: 'bad' }, { text: '容器 :80', tone: 'dim' }],
          links: [{}, { text: '✗', tone: 'bad' }],
        },
      ],
      note: '容器活在自己的網路泡泡裡，外面預設連不進去。冒號左邊是主機埠（自己挑），右邊是容器內的埠（由 image 決定，別亂動）。',
    },
    {
      scene: [
        {
          kind: 'terminal',
          label: '常見的兩個錯',
          lines: [
            { text: '$ docker run -d -p 8080:80 nginx' },
            { text: 'Bind for 0.0.0.0:8080 failed: port is already allocated', tone: 'bad', note: '換主機埠，如 9090:80' },
            { text: '$ docker run -d --name web nginx' },
            { text: 'The container name "/web" is already in use', tone: 'bad', note: '先 docker rm web' },
          ],
        },
      ],
      note: '主機的埠一次只能給一個容器；容器名稱也不能重複。最後收拾：docker stop web、docker rm web。',
    },
    {
      scene: [
        {
          kind: 'flow',
          label: '容器思維：一個容器一個主程式',
          nodes: [
            { text: 'web 容器', note: 'nginx', tone: 'good' },
            { text: 'api 容器', note: 'Python', tone: 'good' },
            { text: 'db 容器', note: 'postgres', tone: 'good' },
          ],
        },
      ],
      note: '不要把所有東西塞進同一個容器，那會把它養成一台迷你 VM。拆開來，每個都能各自更換、各自擴展。',
    },
  ],
  questions: [
    {
      type: 'choice',
      prompt: '執行 docker run -d nginx（沒加 -p），然後在主機上連 http://localhost:80，結果？',
      options: ['看到 nginx 歡迎頁', '連不上', '自動對應到隨機埠'],
      answer: 1,
      explain: '沒有 -p，容器的埠沒有接到主機上，主機的 localhost:80 沒有人在聽。',
    },
    {
      type: 'choice',
      prompt: '在 -p 8080:80 裡，哪個數字是容器內部的埠？',
      options: ['8080', '80', '兩個都是，只是寫法不同'],
      answer: 1,
      explain: '格式是「主機埠:容器埠」。左邊 8080 在主機上，可以自己換；右邊 80 是 nginx 在容器裡聽的埠。',
    },
  ],
  source: '教材 §1.10、§1.11、§1.12',
  verify: 'K-Line 練習第 2 章：docker run -d --name kline -p 8000:8000 後，用 curl localhost:8000/api/health 確認連得到。',
};
